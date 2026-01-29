import React, { useState, useEffect } from 'react';
import { FiPlus, FiTarget, FiTrendingUp, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useGoalsStore } from '../utils/store';
import { goalsAPI } from '../services/api';

const Goals = () => {
  const { goals, setGoals, addGoal, updateGoal, deleteGoal } = useGoalsStore();
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
    timeHorizon: 'medium',
    goalType: 'wealth_building',
    priority: 'medium',
    riskTolerance: 'moderate',
    investmentExperience: 'beginner'
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await goalsAPI.getGoals();
      setGoals(response.data.goals);
    } catch (error) {
      toast.error('Failed to load goals');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        // Update existing goal
        const response = await goalsAPI.updateGoal(editingGoal.id, formData);
        updateGoal(editingGoal.id, response.data.goal);
        toast.success('Goal updated successfully!');
      } else {
        // Create new goal
        const response = await goalsAPI.createGoal(formData);
        addGoal(response.data.goal);
        toast.success('Goal created successfully!');
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(editingGoal ? 'Failed to update goal' : 'Failed to create goal');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
      timeHorizon: goal.timeHorizon,
      goalType: goal.goalType,
      priority: goal.priority,
      riskTolerance: goal.riskTolerance || 'moderate',
      investmentExperience: goal.investmentExperience || 'beginner'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalsAPI.deleteGoal(id);
      deleteGoal(id);
      toast.success('Goal deleted');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      currentAmount: '0',
      targetDate: '',
      timeHorizon: 'medium',
      goalType: 'wealth_building',
      priority: 'medium',
      riskTolerance: 'moderate',
      investmentExperience: 'beginner'
    });
    setEditingGoal(null);
  };

  const calculateProgress = (goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Financial Goals</h1>
          <p className="text-gray-500 mt-1">Set and track your investment goals</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
        >
          <FiPlus />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          const daysRemaining = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));

          return (
            <div key={goal.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <FiTarget className="text-primary-500 w-6 h-6" />
                  <h3 className="font-bold text-lg text-gray-800">{goal.title}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="text-gray-400 hover:text-primary-500"
                    title="Edit goal"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-gray-400 hover:text-red-500"
                    title="Delete goal"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{goal.description}</p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-800">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Current</p>
                    <p className="font-semibold text-gray-800">
                      R{parseFloat(goal.currentAmount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Target</p>
                    <p className="font-semibold text-gray-800">
                      R{parseFloat(goal.targetAmount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Days Remaining</span>
                    <span className="font-semibold text-gray-800">{daysRemaining}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Priority</span>
                    <span className={`font-semibold capitalize ${
                      goal.priority === 'high' ? 'text-red-600' :
                      goal.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <FiTarget className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No goals yet</h3>
          <p className="text-gray-500 mb-4">Create your first financial goal to get started</p>
        </div>
      )}

      {/* Create Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Title*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="e.g., Retirement Fund"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    rows="3"
                    placeholder="Describe your goal..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Amount*
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date*
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Horizon
                    </label>
                    <select
                      value={formData.timeHorizon}
                      onChange={(e) => setFormData({ ...formData, timeHorizon: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value="short">Short (&lt;2 years)</option>
                      <option value="medium">Medium (2-5 years)</option>
                      <option value="long">Long (&gt;5 years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Goal Type
                    </label>
                    <select
                      value={formData.goalType}
                      onChange={(e) => setFormData({ ...formData, goalType: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value="retirement">Retirement</option>
                      <option value="education">Education</option>
                      <option value="house">House</option>
                      <option value="emergency_fund">Emergency Fund</option>
                      <option value="wealth_building">Wealth Building</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risk Tolerance*
                    </label>
                    <select
                      required
                      value={formData.riskTolerance}
                      onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Investment Experience*
                    </label>
                    <select
                      required
                      value={formData.investmentExperience}
                      onChange={(e) => setFormData({ ...formData, investmentExperience: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                  >
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
