const PDFDocument = require('pdfkit');
const { createObjectCsvWriter } = require('csv-writer');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;
const { User, Goal, Portfolio, Transaction } = require('../models/postgres');
const { ActivityLog } = require('../models/mongodb');
const { Op } = require('sequelize');

class ReportService {
  constructor() {
    // Ensure reports directory exists
    this.reportsDir = path.join(__dirname, '../../temp/reports');
    this.initializeReportsDirectory();
  }

  async initializeReportsDirectory() {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create reports directory:', error);
    }
  }

  /**
   * Generate User Activity Report
   */
  async generateUserActivityReport(format, filters = {}) {
    const { startDate, endDate, userId, action, status } = filters;

    // Build query filters
    const query = {};
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (status) query.status = status;

    // Fetch activity logs
    const activities = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(10000)
      .lean();

    // Fetch user details for activities
    const userIds = [...new Set(activities.map(a => a.userId).filter(Boolean))];
    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ['id', 'email', 'firstName', 'lastName']
    });
    const userMap = {};
    users.forEach(u => {
      userMap[u.id] = `${u.firstName} ${u.lastName} (${u.email})`;
    });

    // Format data for report
    const reportData = activities.map(activity => ({
      timestamp: new Date(activity.timestamp).toLocaleString(),
      user: userMap[activity.userId] || activity.userEmail || 'Unknown',
      action: activity.action,
      description: activity.description || '-',
      status: activity.status,
      ipAddress: activity.ipAddress || '-'
    }));

    if (format === 'pdf') {
      return this.generateUserActivityPDF(reportData);
    } else if (format === 'csv') {
      return this.generateUserActivityCSV(reportData);
    } else if (format === 'excel') {
      return this.generateUserActivityExcel(reportData);
    }
  }

  async generateUserActivityPDF(data) {
    const doc = new PDFDocument({ margin: 50 });
    const filename = `user-activity-${Date.now()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);
    const stream = require('fs').createWriteStream(filepath);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('User Activity Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Total Activities: ${data.length}`, { align: 'center' });
    doc.moveDown(2);

    // Table Header
    doc.fontSize(9).font('Helvetica-Bold');
    const tableTop = doc.y;
    doc.text('Timestamp', 50, tableTop, { width: 100 });
    doc.text('User', 155, tableTop, { width: 140 });
    doc.text('Action', 300, tableTop, { width: 100 });
    doc.text('Status', 405, tableTop, { width: 60 });
    doc.text('IP', 470, tableTop, { width: 80 });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Table Rows
    doc.font('Helvetica').fontSize(8);
    data.slice(0, 50).forEach((row, index) => {
      const y = doc.y;

      if (y > 700) {
        doc.addPage();
      }

      doc.text(row.timestamp, 50, doc.y, { width: 100 });
      doc.text(row.user, 155, y, { width: 140 });
      doc.text(row.action, 300, y, { width: 100 });
      doc.text(row.status, 405, y, { width: 60 });
      doc.text(row.ipAddress, 470, y, { width: 80 });

      doc.moveDown(0.8);
    });

    if (data.length > 50) {
      doc.moveDown();
      doc.fontSize(9).text(`Note: Showing first 50 of ${data.length} activities`, { align: 'center' });
    }

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve({ filepath, filename }));
      stream.on('error', reject);
    });
  }

  async generateUserActivityCSV(data) {
    const filename = `user-activity-${Date.now()}.csv`;
    const filepath = path.join(this.reportsDir, filename);

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'user', title: 'User' },
        { id: 'action', title: 'Action' },
        { id: 'description', title: 'Description' },
        { id: 'status', title: 'Status' },
        { id: 'ipAddress', title: 'IP Address' }
      ]
    });

    await csvWriter.writeRecords(data);
    return { filepath, filename };
  }

  async generateUserActivityExcel(data) {
    const filename = `user-activity-${Date.now()}.xlsx`;
    const filepath = path.join(this.reportsDir, filename);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('User Activity');

    // Set columns
    worksheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 20 },
      { header: 'User', key: 'user', width: 30 },
      { header: 'Action', key: 'action', width: 20 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'IP Address', key: 'ipAddress', width: 15 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    worksheet.addRows(data);

    await workbook.xlsx.writeFile(filepath);
    return { filepath, filename };
  }

  /**
   * Generate Usage Report
   */
  async generateUsageReport(format, filters = {}) {
    const { startDate, endDate } = filters;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Fetch statistics
    const totalUsers = await User.count();
    const activeUsers = await User.count({
      where: { lastLogin: { [Op.gte]: start } }
    });
    const newUsers = await User.count({
      where: { createdAt: { [Op.between]: [start, end] } }
    });

    const totalGoals = await Goal.count();
    const activeGoals = await Goal.count({ where: { status: 'active' } });
    const completedGoals = await Goal.count({ where: { status: 'completed' } });

    const totalPortfolios = await Portfolio.count();
    const totalTransactions = await Transaction.count({
      where: { createdAt: { [Op.between]: [start, end] } }
    });

    // Activity statistics
    const activityStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const reportData = {
      period: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0
      },
      goals: {
        total: totalGoals,
        active: activeGoals,
        completed: completedGoals,
        completionRate: totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(2) : 0
      },
      portfolios: {
        total: totalPortfolios
      },
      transactions: {
        totalInPeriod: totalTransactions
      },
      activities: activityStats.map(a => ({
        action: a._id,
        count: a.count
      }))
    };

    if (format === 'pdf') {
      return this.generateUsagePDF(reportData);
    } else if (format === 'csv') {
      return this.generateUsageCSV(reportData);
    } else if (format === 'excel') {
      return this.generateUsageExcel(reportData);
    }
  }

  async generateUsagePDF(data) {
    const doc = new PDFDocument({ margin: 50 });
    const filename = `usage-report-${Date.now()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);
    const stream = require('fs').createWriteStream(filepath);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('System Usage Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.fontSize(10).text(`Period: ${data.period}`, { align: 'center' });
    doc.moveDown(2);

    // User Statistics
    doc.fontSize(14).font('Helvetica-Bold').text('User Statistics');
    doc.moveDown();
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Users: ${data.users.total}`);
    doc.text(`Active Users (in period): ${data.users.active} (${data.users.activePercentage}%)`);
    doc.text(`New Users: ${data.users.new}`);
    doc.moveDown(2);

    // Goal Statistics
    doc.fontSize(14).font('Helvetica-Bold').text('Goal Statistics');
    doc.moveDown();
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Goals: ${data.goals.total}`);
    doc.text(`Active Goals: ${data.goals.active}`);
    doc.text(`Completed Goals: ${data.goals.completed}`);
    doc.text(`Completion Rate: ${data.goals.completionRate}%`);
    doc.moveDown(2);

    // Portfolio Statistics
    doc.fontSize(14).font('Helvetica-Bold').text('Portfolio Statistics');
    doc.moveDown();
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Portfolios: ${data.portfolios.total}`);
    doc.moveDown(2);

    // Transaction Statistics
    doc.fontSize(14).font('Helvetica-Bold').text('Transaction Statistics');
    doc.moveDown();
    doc.fontSize(11).font('Helvetica');
    doc.text(`Transactions in Period: ${data.transactions.totalInPeriod}`);
    doc.moveDown(2);

    // Activity Breakdown
    doc.fontSize(14).font('Helvetica-Bold').text('Top Activities in Period');
    doc.moveDown();
    doc.fontSize(10).font('Helvetica');
    data.activities.slice(0, 15).forEach(activity => {
      doc.text(`${activity.action}: ${activity.count}`);
    });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve({ filepath, filename }));
      stream.on('error', reject);
    });
  }

  async generateUsageCSV(data) {
    const filename = `usage-report-${Date.now()}.csv`;
    const filepath = path.join(this.reportsDir, filename);

    const records = [
      { metric: 'Report Period', value: data.period },
      { metric: '', value: '' },
      { metric: 'USER STATISTICS', value: '' },
      { metric: 'Total Users', value: data.users.total },
      { metric: 'Active Users', value: data.users.active },
      { metric: 'Active Percentage', value: `${data.users.activePercentage}%` },
      { metric: 'New Users', value: data.users.new },
      { metric: '', value: '' },
      { metric: 'GOAL STATISTICS', value: '' },
      { metric: 'Total Goals', value: data.goals.total },
      { metric: 'Active Goals', value: data.goals.active },
      { metric: 'Completed Goals', value: data.goals.completed },
      { metric: 'Completion Rate', value: `${data.goals.completionRate}%` },
      { metric: '', value: '' },
      { metric: 'PORTFOLIO STATISTICS', value: '' },
      { metric: 'Total Portfolios', value: data.portfolios.total },
      { metric: '', value: '' },
      { metric: 'TRANSACTION STATISTICS', value: '' },
      { metric: 'Transactions in Period', value: data.transactions.totalInPeriod },
      { metric: '', value: '' },
      { metric: 'TOP ACTIVITIES', value: '' },
      ...data.activities.map(a => ({ metric: a.action, value: a.count }))
    ];

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'metric', title: 'Metric' },
        { id: 'value', title: 'Value' }
      ]
    });

    await csvWriter.writeRecords(records);
    return { filepath, filename };
  }

  async generateUsageExcel(data) {
    const filename = `usage-report-${Date.now()}.xlsx`;
    const filepath = path.join(this.reportsDir, filename);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usage Report');

    // Title
    worksheet.mergeCells('A1:B1');
    worksheet.getCell('A1').value = 'System Usage Report';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.getCell('A2').value = `Period: ${data.period}`;
    worksheet.mergeCells('A2:B2');
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    let row = 4;

    // User Statistics
    worksheet.getCell(`A${row}`).value = 'USER STATISTICS';
    worksheet.getCell(`A${row}`).font = { bold: true };
    row++;
    worksheet.getCell(`A${row}`).value = 'Total Users';
    worksheet.getCell(`B${row}`).value = data.users.total;
    row++;
    worksheet.getCell(`A${row}`).value = 'Active Users';
    worksheet.getCell(`B${row}`).value = data.users.active;
    row++;
    worksheet.getCell(`A${row}`).value = 'Active Percentage';
    worksheet.getCell(`B${row}`).value = `${data.users.activePercentage}%`;
    row++;
    worksheet.getCell(`A${row}`).value = 'New Users';
    worksheet.getCell(`B${row}`).value = data.users.new;
    row += 2;

    // Goal Statistics
    worksheet.getCell(`A${row}`).value = 'GOAL STATISTICS';
    worksheet.getCell(`A${row}`).font = { bold: true };
    row++;
    worksheet.getCell(`A${row}`).value = 'Total Goals';
    worksheet.getCell(`B${row}`).value = data.goals.total;
    row++;
    worksheet.getCell(`A${row}`).value = 'Active Goals';
    worksheet.getCell(`B${row}`).value = data.goals.active;
    row++;
    worksheet.getCell(`A${row}`).value = 'Completed Goals';
    worksheet.getCell(`B${row}`).value = data.goals.completed;
    row++;
    worksheet.getCell(`A${row}`).value = 'Completion Rate';
    worksheet.getCell(`B${row}`).value = `${data.goals.completionRate}%`;
    row += 2;

    // Portfolio Statistics
    worksheet.getCell(`A${row}`).value = 'PORTFOLIO STATISTICS';
    worksheet.getCell(`A${row}`).font = { bold: true };
    row++;
    worksheet.getCell(`A${row}`).value = 'Total Portfolios';
    worksheet.getCell(`B${row}`).value = data.portfolios.total;
    row += 2;

    // Transaction Statistics
    worksheet.getCell(`A${row}`).value = 'TRANSACTION STATISTICS';
    worksheet.getCell(`A${row}`).font = { bold: true };
    row++;
    worksheet.getCell(`A${row}`).value = 'Transactions in Period';
    worksheet.getCell(`B${row}`).value = data.transactions.totalInPeriod;
    row += 2;

    // Activities
    worksheet.getCell(`A${row}`).value = 'TOP ACTIVITIES';
    worksheet.getCell(`A${row}`).font = { bold: true };
    row++;
    data.activities.forEach(activity => {
      worksheet.getCell(`A${row}`).value = activity.action;
      worksheet.getCell(`B${row}`).value = activity.count;
      row++;
    });

    // Column widths
    worksheet.getColumn('A').width = 30;
    worksheet.getColumn('B').width = 20;

    await workbook.xlsx.writeFile(filepath);
    return { filepath, filename };
  }

  /**
   * Generate System Performance/Audit Report
   */
  async generateSystemPerformanceReport(format, filters = {}) {
    const { startDate, endDate } = filters;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Admin activities
    const adminActivities = await ActivityLog.find({
      timestamp: { $gte: start, $lte: end },
      action: { $in: ['admin_access', 'generate_report', 'update_user_status', 'update_user_role'] }
    }).sort({ timestamp: -1 }).limit(100).lean();

    // Error logs
    const errorLogs = await ActivityLog.find({
      timestamp: { $gte: start, $lte: end },
      status: 'failed'
    }).sort({ timestamp: -1 }).limit(50).lean();

    // System health metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    const reportData = {
      period: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      systemHealth: {
        uptime: `${Math.floor(uptime / 3600)} hours`,
        memoryUsage: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        memoryTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`
      },
      adminActivities: adminActivities.map(a => ({
        timestamp: new Date(a.timestamp).toLocaleString(),
        userEmail: a.userEmail,
        action: a.action,
        description: a.description || '-',
        ipAddress: a.ipAddress || '-'
      })),
      errorLogs: errorLogs.map(e => ({
        timestamp: new Date(e.timestamp).toLocaleString(),
        userEmail: e.userEmail || 'System',
        action: e.action,
        description: e.description || '-'
      }))
    };

    if (format === 'pdf') {
      return this.generatePerformancePDF(reportData);
    } else if (format === 'csv') {
      return this.generatePerformanceCSV(reportData);
    } else if (format === 'excel') {
      return this.generatePerformanceExcel(reportData);
    }
  }

  async generatePerformancePDF(data) {
    const doc = new PDFDocument({ margin: 50 });
    const filename = `performance-report-${Date.now()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);
    const stream = require('fs').createWriteStream(filepath);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('System Performance & Audit Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.fontSize(10).text(`Period: ${data.period}`, { align: 'center' });
    doc.moveDown(2);

    // System Health
    doc.fontSize(14).font('Helvetica-Bold').text('System Health');
    doc.moveDown();
    doc.fontSize(11).font('Helvetica');
    doc.text(`Uptime: ${data.systemHealth.uptime}`);
    doc.text(`Memory Usage: ${data.systemHealth.memoryUsage} / ${data.systemHealth.memoryTotal}`);
    doc.moveDown(2);

    // Admin Activities
    doc.fontSize(14).font('Helvetica-Bold').text('Admin Activities');
    doc.moveDown();
    doc.fontSize(9).font('Helvetica');
    data.adminActivities.slice(0, 20).forEach(activity => {
      doc.text(`${activity.timestamp} - ${activity.userEmail}`, { continued: true });
      doc.text(` - ${activity.action}`);
      if (activity.description !== '-') {
        doc.fontSize(8).text(`  ${activity.description}`);
        doc.fontSize(9);
      }
      doc.moveDown(0.3);
    });

    doc.moveDown(2);

    // Error Logs
    if (data.errorLogs.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('Error Logs');
      doc.moveDown();
      doc.fontSize(9).font('Helvetica');
      data.errorLogs.slice(0, 15).forEach(error => {
        doc.text(`${error.timestamp} - ${error.userEmail}`, { continued: true });
        doc.text(` - ${error.action}`);
        if (error.description !== '-') {
          doc.fontSize(8).text(`  ${error.description}`);
          doc.fontSize(9);
        }
        doc.moveDown(0.3);
      });
    }

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve({ filepath, filename }));
      stream.on('error', reject);
    });
  }

  async generatePerformanceCSV(data) {
    const filename = `performance-report-${Date.now()}.csv`;
    const filepath = path.join(this.reportsDir, filename);

    const records = [
      { section: 'Report Period', data1: data.period, data2: '', data3: '' },
      { section: '', data1: '', data2: '', data3: '' },
      { section: 'SYSTEM HEALTH', data1: '', data2: '', data3: '' },
      { section: 'Uptime', data1: data.systemHealth.uptime, data2: '', data3: '' },
      { section: 'Memory Usage', data1: data.systemHealth.memoryUsage, data2: '', data3: '' },
      { section: 'Memory Total', data1: data.systemHealth.memoryTotal, data2: '', data3: '' },
      { section: '', data1: '', data2: '', data3: '' },
      { section: 'ADMIN ACTIVITIES', data1: '', data2: '', data3: '' },
      { section: 'Timestamp', data1: 'User', data2: 'Action', data3: 'Description' },
      ...data.adminActivities.map(a => ({
        section: a.timestamp,
        data1: a.userEmail,
        data2: a.action,
        data3: a.description
      })),
      { section: '', data1: '', data2: '', data3: '' },
      { section: 'ERROR LOGS', data1: '', data2: '', data3: '' },
      { section: 'Timestamp', data1: 'User', data2: 'Action', data3: 'Description' },
      ...data.errorLogs.map(e => ({
        section: e.timestamp,
        data1: e.userEmail,
        data2: e.action,
        data3: e.description
      }))
    ];

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'section', title: 'Section' },
        { id: 'data1', title: 'Data 1' },
        { id: 'data2', title: 'Data 2' },
        { id: 'data3', title: 'Data 3' }
      ]
    });

    await csvWriter.writeRecords(records);
    return { filepath, filename };
  }

  async generatePerformanceExcel(data) {
    const filename = `performance-report-${Date.now()}.xlsx`;
    const filepath = path.join(this.reportsDir, filename);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Performance Report');

    // Title
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = 'System Performance & Audit Report';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.getCell('A2').value = `Period: ${data.period}`;
    worksheet.mergeCells('A2:D2');
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    let row = 4;

    // System Health
    worksheet.getCell(`A${row}`).value = 'SYSTEM HEALTH';
    worksheet.getCell(`A${row}`).font = { bold: true };
    row++;
    worksheet.getCell(`A${row}`).value = 'Uptime';
    worksheet.getCell(`B${row}`).value = data.systemHealth.uptime;
    row++;
    worksheet.getCell(`A${row}`).value = 'Memory Usage';
    worksheet.getCell(`B${row}`).value = data.systemHealth.memoryUsage;
    row++;
    worksheet.getCell(`A${row}`).value = 'Memory Total';
    worksheet.getCell(`B${row}`).value = data.systemHealth.memoryTotal;
    row += 2;

    // Admin Activities
    worksheet.getCell(`A${row}`).value = 'ADMIN ACTIVITIES';
    worksheet.getCell(`A${row}`).font = { bold: true };
    row++;
    worksheet.getCell(`A${row}`).value = 'Timestamp';
    worksheet.getCell(`B${row}`).value = 'User';
    worksheet.getCell(`C${row}`).value = 'Action';
    worksheet.getCell(`D${row}`).value = 'Description';
    worksheet.getRow(row).font = { bold: true };
    row++;
    data.adminActivities.forEach(activity => {
      worksheet.getCell(`A${row}`).value = activity.timestamp;
      worksheet.getCell(`B${row}`).value = activity.userEmail;
      worksheet.getCell(`C${row}`).value = activity.action;
      worksheet.getCell(`D${row}`).value = activity.description;
      row++;
    });
    row++;

    // Error Logs
    if (data.errorLogs.length > 0) {
      worksheet.getCell(`A${row}`).value = 'ERROR LOGS';
      worksheet.getCell(`A${row}`).font = { bold: true };
      row++;
      worksheet.getCell(`A${row}`).value = 'Timestamp';
      worksheet.getCell(`B${row}`).value = 'User';
      worksheet.getCell(`C${row}`).value = 'Action';
      worksheet.getCell(`D${row}`).value = 'Description';
      worksheet.getRow(row).font = { bold: true };
      row++;
      data.errorLogs.forEach(error => {
        worksheet.getCell(`A${row}`).value = error.timestamp;
        worksheet.getCell(`B${row}`).value = error.userEmail;
        worksheet.getCell(`C${row}`).value = error.action;
        worksheet.getCell(`D${row}`).value = error.description;
        row++;
      });
    }

    // Column widths
    worksheet.getColumn('A').width = 20;
    worksheet.getColumn('B').width = 30;
    worksheet.getColumn('C').width = 25;
    worksheet.getColumn('D').width = 40;

    await workbook.xlsx.writeFile(filepath);
    return { filepath, filename };
  }

  /**
   * Clean up old report files
   */
  async cleanupOldReports(maxAgeHours = 24) {
    try {
      const files = await fs.readdir(this.reportsDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        const filepath = path.join(this.reportsDir, file);
        const stats = await fs.stat(filepath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          await fs.unlink(filepath);
          console.log(`Cleaned up old report: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up reports:', error);
    }
  }
}

module.exports = new ReportService();
