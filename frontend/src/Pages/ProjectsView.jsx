import React, { useState } from 'react';
import './ProjectsView.css';

function ProjectsView({ tasks, onAddTask, onToggleTask, onDeleteTask, onUpdateActiveStatus, onAddBulkTasks, onUpdateSubTaskStatus, onReorderSubTask, onEditSubTask, onUpdateSubTaskRemark, onUpdateSubTaskAttachment }) {
  const [showForm, setShowForm] = useState(false);
  const [bulkAddProjectId, setBulkAddProjectId] = useState(null);
  const [viewTasksProjectId, setViewTasksProjectId] = useState(null);
  const [draggedSubTaskId, setDraggedSubTaskId] = useState(null);
  const [editingSubTaskId, setEditingSubTaskId] = useState(null);
  const [remarkingSubTaskId, setRemarkingSubTaskId] = useState(null);
  const [remarkText, setRemarkText] = useState('');
  const [editSubTaskText, setEditSubTaskText] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, targetSelect: null, originalValue: null, newValue: null });
  const [formData, setFormData] = useState({
    title: '',
    owner: '',
    medium: '',
    startDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onAddTask({
      title: formData.title.trim(),
      owner: formData.owner.trim() || 'Unassigned',
      medium: formData.medium.trim() || 'General',
      startDate: formData.startDate || new Date().toISOString().split('T')[0]
    });
    setFormData({
      title: '',
      owner: '',
      medium: '',
      startDate: ''
    });
    setShowForm(false);
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    // Detect inline numbers like `1`, `1.`, `2)` and replace with newline + number
    const normalizedText = bulkText.replace(/(^|\s+)(\d+[\.\)]?\s+)/g, '\n$2');
    const lines = normalizedText.split('\n');
    const parsedTasks = lines
      .map(line => line.replace(/^\d+[\.\)]?\s*/, '').trim())
      .filter(line => line.length > 0);

    if (parsedTasks.length > 0 && onAddBulkTasks) {
      onAddBulkTasks(bulkAddProjectId, parsedTasks);
    }
    setBulkAddProjectId(null);
    setBulkText('');
  };

  return (
    <div className="tasks-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 className="view-title">Projects</h1>
          <p className="view-subtitle" style={{ marginBottom: 0 }}>Manage project milestones and update task status.</p>
        </div>
        {!bulkAddProjectId && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {showForm ? 'Cancel' : '+ Add Project'}
          </button>
        )}
      </div>


      {/* Dynamic Slide-down Input Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="task-detail-form" style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.75rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <h3 className="section-heading" style={{ marginBottom: '1.25rem' }}>New Task Details</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="custom-input-wrapper" style={{ marginBottom: 0 }}>
              <span className="custom-label">Title</span>
              <input
                type="text"
                name="title"
                required
                className="custom-input"
                placeholder="e.g. Design Landing Page"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="custom-input-wrapper" style={{ marginBottom: 0 }}>
              <span className="custom-label">Owner</span>
              <input
                type="text"
                name="owner"
                className="custom-input"
                placeholder="e.g. John Doe"
                value={formData.owner}
                onChange={handleChange}
              />
            </div>

            <div className="custom-input-wrapper" style={{ marginBottom: 0 }}>
              <span className="custom-label">Medium</span>
              <input
                type="text"
                name="medium"
                className="custom-input"
                placeholder="e.g. Slack / Trello"
                value={formData.medium}
                onChange={handleChange}
              />
            </div>

            <div className="custom-input-wrapper" style={{ marginBottom: 0 }}>
              <span className="custom-label">Start Date</span>
              <input
                type="date"
                name="startDate"
                className="custom-input"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Discard
            </button>
            <button type="submit" className="btn btn-primary">
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Task List or Bulk Add */}
      {bulkAddProjectId ? (
        <div className="bulk-add-container" style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-heading)' }}>Bulk Add Tasks</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Enter tasks separated by new lines or numbers (e.g., "1. First task 2. Second task" or line by line).
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-body)',
              color: 'var(--text-heading)',
              fontFamily: 'inherit',
              marginBottom: '1.5rem',
              resize: 'vertical',
              fontSize: '1rem'
            }}
            placeholder="1. Set up repository&#10;2. Configure Webpack&#10;3. Write tests"
          />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => { setBulkAddProjectId(null); setBulkText(''); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBulkSubmit}>Save Tasks</button>
          </div>
        </div>
      ) : (
      <div className="task-list">
        {tasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
            No tasks found. Add a task above to get started!
          </p>
        ) : (
          tasks.map((task) => {
            const totalSubTasks = task.subTasks ? task.subTasks.length : 0;
            const completedSubTasks = task.subTasks ? task.subTasks.filter(sub => sub.status === 'Completed').length : 0;
            const inProgressSubTasks = task.subTasks ? task.subTasks.filter(sub => sub.status === 'In-Progress').length : 0;
            const percentage = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;
            
            let projectStatus = 'Not Started';
            if (totalSubTasks > 0) {
              if (completedSubTasks === totalSubTasks) {
                projectStatus = 'Completed';
              } else if (completedSubTasks > 0 || inProgressSubTasks > 0) {
                projectStatus = 'In-Progress';
              }
            }
            return (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`} style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '0.6rem 1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="task-text" style={{ fontWeight: '600', fontSize: '1.05rem' }}>
                        {task.title}
                      </span>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '12px',
                        backgroundColor: percentage === 100 && totalSubTasks > 0 ? 'var(--success-bg)' : 'var(--bg-body)',
                        border: `1px solid ${percentage === 100 && totalSubTasks > 0 ? 'var(--success)' : 'var(--primary)'}`,
                        color: percentage === 100 && totalSubTasks > 0 ? 'var(--success)' : 'var(--primary)',
                        fontWeight: '600',
                        fontSize: '0.75rem',
                        lineHeight: '1'
                      }}>
                        {percentage}%
                      </div>
                    </div>
                <div className="task-meta-row" style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  <span>👤 Owner: <strong>{task.owner}</strong></span>
                  <span>⚡ Medium: <strong>{task.medium}</strong></span>
                  <span>📅 Started: <strong>{task.startDate ? task.startDate.split('T')[0] : ''}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" disabled={viewTasksProjectId === task.id} onClick={() => setBulkAddProjectId(task.id)}>Add Tasks</button>
                <button 
                  className="btn btn-secondary" 
                  disabled={totalSubTasks === 0 && viewTasksProjectId !== task.id}
                  onClick={() => setViewTasksProjectId(viewTasksProjectId === task.id ? null : task.id)}
                >
                  {viewTasksProjectId === task.id ? 'Hide Tasks' : 'View Tasks'}
                </button>
                <button className="btn btn-secondary" disabled={viewTasksProjectId === task.id}>Edit</button>
                <select 
                  className="btn btn-secondary" 
                  disabled={viewTasksProjectId === task.id}
                  style={{ appearance: 'auto', paddingRight: '1.5rem', cursor: 'pointer' }}
                  value={task.activeStatus || 'Active'}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    const originalValue = newValue === 'Active' ? 'In-Active' : 'Active';
                    // Revert visually while modal is open
                    e.target.value = originalValue;
                    setConfirmModal({ isOpen: true, targetSelect: e.target, originalValue, newValue, taskId: task.id });
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="In-Active">In-Active</option>
                </select>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: projectStatus === 'Completed' ? 'var(--success-bg)' : projectStatus === 'In-Progress' ? '#fef3c7' : 'var(--bg-body)',
                  color: projectStatus === 'Completed' ? 'var(--success)' : projectStatus === 'In-Progress' ? '#d97706' : 'var(--text-muted)',
                  border: `1px solid ${projectStatus === 'Completed' ? 'var(--success)' : projectStatus === 'In-Progress' ? '#f59e0b' : 'var(--border)'}`
                }}>
                  {projectStatus}
                </div>
              </div>
              </div>
              
              {viewTasksProjectId === task.id && (
                <div className="roadmap-container">
                  <div className="roadmap-line"></div>
                  {task.subTasks && task.subTasks.length > 0 ? (
                    task.subTasks.map(sub => (
                      <div 
                        key={sub.id} 
                        className={`roadmap-item ${draggedSubTaskId === sub.id ? 'dragging' : ''}`}
                        draggable={true}
                        onDragStart={(e) => {
                          setDraggedSubTaskId(sub.id);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", sub.id);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedSubTaskId && draggedSubTaskId !== sub.id) {
                            onReorderSubTask && onReorderSubTask(task.id, draggedSubTaskId, sub.id);
                          }
                          setDraggedSubTaskId(null);
                        }}
                        onDragEnd={() => setDraggedSubTaskId(null)}
                      >
                        <div className={`roadmap-dot ${sub.status === 'Completed' ? 'completed' : ''} ${sub.status === 'In-Progress' ? 'in-progress' : ''}`}>
                          {sub.status === 'Completed' && <span style={{ color: 'white', fontSize: '11px', fontWeight: 'bold' }}>✓</span>}
                        </div>
                        <div className="roadmap-content" style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '1rem', width: '100%' }}>
                          {editingSubTaskId === sub.id ? (
                            <input 
                              type="text" 
                              value={editSubTaskText}
                              onChange={(e) => setEditSubTaskText(e.target.value)}
                              onBlur={() => {
                                if (editSubTaskText.trim() && editSubTaskText.trim() !== sub.title && onEditSubTask) {
                                  onEditSubTask(task.id, sub.id, editSubTaskText.trim());
                                }
                                setEditingSubTaskId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (editSubTaskText.trim() && editSubTaskText.trim() !== sub.title && onEditSubTask) {
                                    onEditSubTask(task.id, sub.id, editSubTaskText.trim());
                                  }
                                  setEditingSubTaskId(null);
                                } else if (e.key === 'Escape') {
                                  setEditingSubTaskId(null);
                                }
                              }}
                              autoFocus
                              style={{ 
                                flex: 1, 
                                marginRight: '1rem', 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '4px', 
                                border: '1px solid var(--primary)', 
                                outline: 'none',
                                background: 'var(--bg-body)',
                                color: 'var(--text-heading)'
                              }}
                            />
                          ) : (
                            <span style={{ 
                              textDecoration: 'none',
                              opacity: sub.status === 'Completed' ? 0.7 : 1,
                              color: sub.status === 'Completed' ? 'var(--text-muted)' : 'inherit',
                              marginRight: '1rem',
                              flex: 1,
                              transition: 'opacity 0.2s ease'
                            }}>
                              {sub.title}
                            </span>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div 
                              style={{ 
                                cursor: 'grab', 
                                color: 'var(--text-muted)', 
                                padding: '0 8px', 
                                fontSize: '1.2rem', 
                                userSelect: 'none' 
                              }}
                              title="Drag to reorder"
                            >
                              ≡
                            </div>
                            <input 
                              type="file" 
                              id={`file-upload-${sub.id}`} 
                              style={{ display: 'none' }} 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  if (onUpdateSubTaskAttachment) {
                                    onUpdateSubTaskAttachment(task.id, sub.id, e.target.files[0]);
                                  }
                                }
                              }}
                            />
                            <div 
                              style={{ 
                                cursor: 'pointer', 
                                color: 'var(--text-muted)', 
                                padding: '0 4px', 
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Add Attachment"
                              onClick={() => {
                                document.getElementById(`file-upload-${sub.id}`).click();
                              }}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                            </div>
                            <div 
                              style={{ 
                                cursor: 'pointer', 
                                color: 'var(--text-muted)', 
                                padding: '0 4px', 
                                fontSize: '1rem', 
                                userSelect: 'none',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Add Remarks"
                              onClick={() => {
                                setRemarkingSubTaskId(sub.id);
                                setRemarkText(sub.remark || '');
                              }}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </div>
                            <div 
                              style={{ 
                                cursor: 'pointer', 
                                color: 'var(--text-muted)', 
                                padding: '0 4px', 
                                fontSize: '1rem', 
                                userSelect: 'none',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Edit Task"
                              onClick={() => {
                                setEditingSubTaskId(sub.id);
                                setEditSubTaskText(sub.title);
                              }}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </div>
                            <select 
                              className="status-select" 
                              value={sub.status || 'Not Started'} 
                              onChange={(e) => onUpdateSubTaskStatus && onUpdateSubTaskStatus(task.id, sub.id, e.target.value)}
                            >
                              <option value="Not Started">Not Started</option>
                              <option value="In-Progress">In-Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                          </div>
                          {(remarkingSubTaskId === sub.id || sub.remark) && (
                            <div style={{ paddingRight: '1rem', paddingBottom: '0.25rem' }}>
                              {remarkingSubTaskId === sub.id ? (
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                  <textarea 
                                    value={remarkText}
                                    onChange={(e) => setRemarkText(e.target.value)}
                                    placeholder="Add your remarks here..."
                                    rows={2}
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      borderRadius: '4px',
                                      border: '1px solid var(--border)',
                                      fontFamily: 'inherit',
                                      fontSize: '0.85rem',
                                      resize: 'vertical'
                                    }}
                                    autoFocus
                                  />
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button 
                                      onClick={() => setRemarkingSubTaskId(null)}
                                      className="btn btn-secondary" 
                                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                                    >Cancel</button>
                                    <button 
                                      onClick={() => {
                                        if (onUpdateSubTaskRemark) {
                                          onUpdateSubTaskRemark(task.id, sub.id, remarkText.trim());
                                        }
                                        setRemarkingSubTaskId(null);
                                      }}
                                      className="btn btn-primary"
                                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                                    >Save</button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ 
                                  fontSize: '0.85rem', 
                                  color: 'var(--text-muted)', 
                                  backgroundColor: 'var(--bg-card)', 
                                  padding: '0.5rem', 
                                  borderRadius: '4px',
                                  borderLeft: '3px solid var(--primary)',
                                  whiteSpace: 'pre-wrap',
                                  boxShadow: 'var(--shadow-sm)'
                                }}>
                                  {sub.remark}
                                </div>
                              )}
                              
                              {sub.attachment_original_name && (
                                <div style={{ marginTop: '0.5rem' }}>
                                  <a 
                                    href={`http://localhost:5000/uploads/${sub.attachment_filename}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      fontSize: '0.75rem',
                                      color: 'var(--primary)',
                                      backgroundColor: 'var(--bg-body)',
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '12px',
                                      textDecoration: 'none',
                                      border: '1px solid var(--border)'
                                    }}
                                  >
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    {sub.attachment_original_name}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="roadmap-empty">No tasks added yet. Click 'Add Tasks' to get started!</div>
                  )}
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', minWidth: '320px', boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.2s ease-out' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text-heading)', fontSize: '1.25rem' }}>Are you sure?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Change status to <strong>{confirmModal.newValue}</strong>?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmModal({ isOpen: false, targetSelect: null, originalValue: null, newValue: null })}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (confirmModal.targetSelect) {
                  confirmModal.targetSelect.value = confirmModal.newValue;
                  if (onUpdateActiveStatus && confirmModal.taskId) {
                    onUpdateActiveStatus(confirmModal.taskId, confirmModal.newValue);
                  }
                }
                setConfirmModal({ isOpen: false, targetSelect: null, originalValue: null, newValue: null, taskId: null });
              }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsView;
