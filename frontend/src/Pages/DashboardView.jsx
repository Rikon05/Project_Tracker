import React, { useState } from 'react';
import './DashboardView.css';

function DashboardView({ tasks, totalTasks, completedTasks }) {
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [visibleRemarkSubtaskId, setVisibleRemarkSubtaskId] = useState(null);
  const [viewAllCategories, setViewAllCategories] = useState({});
  const getProjectMetrics = (task) => {
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
    
    return { projectStatus, percentage };
  };

  const activeProjects = tasks ? tasks.filter(t => t.activeStatus !== 'In-Active' && getProjectMetrics(t).projectStatus === 'In-Progress') : [];
  const upcomingProjects = tasks ? tasks.filter(t => t.activeStatus !== 'In-Active' && getProjectMetrics(t).projectStatus === 'Not Started') : [];
  const completedProjects = tasks ? tasks.filter(t => t.activeStatus !== 'In-Active' && getProjectMetrics(t).projectStatus === 'Completed') : [];
  const inactiveProjects = tasks ? tasks.filter(t => t.activeStatus === 'In-Active') : [];

  const categoryConfig = {
    'Active Projects': {
      color: '#3b82f6', // Blue
      bg: '#eff6ff',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
      rowIcon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      )
    },
    'Upcoming Projects': {
      color: '#8b5cf6', // Purple
      bg: '#f5f3ff',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      ),
      rowIcon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
        </svg>
      )
    },
    'Completed Projects': {
      color: '#10b981', // Green
      bg: '#ecfdf5',
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
        </svg>
      ),
      rowIcon: (
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
        </svg>
      )
    },
    'In-Active Projects': {
      color: '#64748b', // Slate
      bg: '#f8fafc',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      rowIcon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
  };

  const renderProjectList = (title, projectsList) => {
    if (!projectsList || projectsList.length === 0) return null;

    const config = categoryConfig[title] || { color: '#94a3b8', bg: '#f1f5f9', icon: null, rowIcon: null };
    const { color, bg, icon, rowIcon } = config;
    const count = projectsList.length;
    
    const isViewAll = viewAllCategories[title];
    const displayedProjects = isViewAll ? projectsList : projectsList.slice(0, 3);

    return (
      <div style={{ marginBottom: '2.5rem' }}>
        {/* Header Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ color: color, display: 'flex', alignItems: 'center' }}>
              {icon}
            </div>
            <h2 style={{ fontSize: '1.0rem', fontWeight: '700', color: title === 'Active Projects' ? '#1d4ed8' : color, margin: 0 }}>
              {title}
            </h2>
            <div style={{
              backgroundColor: bg,
              color: color,
              padding: '0.05rem 0.5rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '700',
              marginLeft: '0.2rem'
            }}>
              {count}
            </div>
          </div>
          {count > 3 && (
            <button 
              onClick={() => setViewAllCategories(prev => ({ ...prev, [title]: !prev[title] }))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'none',
                border: `1px solid ${bg}`,
                backgroundColor: bg,
                color: color,
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {isViewAll ? 'View less' : 'View all'} 
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ transform: isViewAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              >
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          )}
        </div>

        {/* Project Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {displayedProjects.map((task) => {
            const { projectStatus, percentage } = getProjectMetrics(task);
            
            // Status styling exactly like mockup
            let statusColor = '#94a3b8';
            let statusBg = '#f1f5f9';
            let statusDot = '#94a3b8';
            
            if (projectStatus === 'Completed') {
              statusColor = '#10b981';
              statusBg = '#ecfdf5';
              statusDot = '#10b981';
            } else if (projectStatus === 'In-Progress') {
              statusColor = '#f59e0b';
              statusBg = '#fffbeb';
              statusDot = '#f59e0b';
            } else if (projectStatus === 'Not Started') {
              statusColor = '#8b5cf6';
              statusBg = '#f5f3ff';
              statusDot = '#8b5cf6';
            }

            const radius = 16;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;

            return (
              <div key={task.id} className="dashboard-project-card" style={{ borderLeft: `5px solid ${color}`, opacity: task.activeStatus === 'In-Active' ? 0.55 : 1 }}>
                <div className="dashboard-project-header">
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  
                  {/* Category Circle Icon */}
                  <div style={{ 
                    width: '30px', height: '30px', 
                    borderRadius: '50%', 
                    backgroundColor: bg, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: color,
                    flexShrink: 0
                  }}>
                    {rowIcon}
                  </div>
                  
                  <h3 style={{ margin: '0', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-heading)', minWidth: '180px' }}>
                    {task.title}
                  </h3>
                  
                  {/* Resource Badges */}
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#475569' }}>
                    <span style={{ width: '130px', padding: '0.35rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', boxSizing: 'border-box' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#475569"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> 
                      {task.owner}
                    </span>
                    <span style={{ width: '100px', padding: '0.35rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', boxSizing: 'border-box' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><path d="M13 2.05v8.45h4.5l-8.5 11.45v-8.45h-4.5l8.5-11.45z"/></svg> 
                      {task.medium}
                    </span>
                    <span style={{ width: '120px', padding: '0.35rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', boxSizing: 'border-box' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/></svg> 
                      {task.startDate ? task.startDate.split('T')[0] : ''}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {/* Round Icon for Percentage */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                      <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
                        <circle
                          cx="20"
                          cy="20"
                          r={radius}
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="4"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r={radius}
                          fill="none"
                          stroke={color}
                          strokeWidth="4"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                      </svg>
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        color: 'var(--text-heading)'
                      }}>
                        {percentage}%
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{
                    padding: '0.35rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: statusBg,
                    color: statusColor,
                    minWidth: '110px',
                    whiteSpace: 'nowrap',
                    justifyContent: 'flex-start'
                  }}>
                    <div className={projectStatus === 'In-Progress' ? 'status-dot-blink' : ''} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusDot, flexShrink: 0 }}></div>
                    {projectStatus}
                  </div>
                  
                  {/* Expand Chevron */}
                  <button 
                    onClick={() => setExpandedProjectId(prev => prev === task.id ? null : task.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0.5rem', color: 'var(--text-muted)',
                      transform: expandedProjectId === task.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Subtasks List */}
              {expandedProjectId === task.id && task.subTasks && task.subTasks.length > 0 && (
                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.4)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {task.subTasks.map((sub, index) => {
                    const isLast = index === task.subTasks.length - 1;
                    const isCompleted = sub.status === 'Completed';
                    return (
                      <div key={sub.id} style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
                        
                        {/* Timeline Column */}
                        <div style={{ position: 'relative', width: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {/* Vertical Line connecting dots */}
                          {!isLast && (
                            <div style={{
                              position: 'absolute',
                              width: '4px',
                              backgroundColor: isCompleted ? '#3b82f6' : '#cbd5e1',
                              top: '1.5rem', 
                              bottom: '-1.5rem',
                              zIndex: 1
                            }} />
                          )}
                          
                          {/* Node Dot */}
                          <div style={{
                            position: 'relative',
                            marginTop: '1rem',
                            width: '22px', height: '22px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? '#10b981' : '#ffffff',
                            border: `3px solid ${isCompleted ? '#10b981' : '#cbd5e1'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 2,
                            boxShadow: '0 0 0 6px rgba(255, 255, 255, 0.4)'
                          }}>
                            {isCompleted && (
                              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                                <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Content Column */}
                        <div style={{ 
                          flex: 1, 
                          display: 'flex', 
                          flexDirection: 'column',
                          justifyContent: 'center',
                          padding: '1rem 0',
                          borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.05)' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '1rem' }}>
                              <span style={{ 
                                fontSize: '0.95rem', 
                                fontWeight: '500', 
                                color: isCompleted ? 'var(--text-muted)' : 'var(--text-heading)', 
                                textDecoration: 'none' 
                              }}>
                                {sub.title}
                              </span>
                              {sub.updated_by && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: 'auto', paddingRight: '1rem' }}>
                                  Updated by: {sub.updated_by}
                                </span>
                              )}
                            </div>
                            
                            {/* Icons for Attachment and Remark */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {sub.attachment_original_name && (
                                <a 
                                  href={`http://localhost:5000/uploads/${sub.attachment_filename}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={sub.attached_by ? `View Attachment (Attached by: ${sub.attached_by})` : 'View Attachment'} 
                                  style={{ color: '#94a3b8', display: 'flex', cursor: 'pointer', textDecoration: 'none' }}
                                >
                                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                </a>
                              )}
                              {sub.remark && (
                                <span 
                                  title="Toggle Remark" 
                                  style={{ color: visibleRemarkSubtaskId === sub.id ? 'var(--primary)' : '#94a3b8', display: 'flex', cursor: 'pointer' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setVisibleRemarkSubtaskId(prev => prev === sub.id ? null : sub.id);
                                  }}
                                >
                                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {visibleRemarkSubtaskId === sub.id && sub.remark && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b', padding: '0.5rem', backgroundColor: 'var(--bg-body)', borderRadius: '4px', borderLeft: '3px solid var(--primary)' }}>
                              <div style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>"{sub.remark}"</div>
                              {sub.commented_by && (
                                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.8, fontStyle: 'italic' }}>
                                  Commented by: {sub.commented_by}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {expandedProjectId === task.id && (!task.subTasks || task.subTasks.length === 0) && (
                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.4)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem'
                }}>
                  No tasks available for this project.
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {renderProjectList('Active Projects', activeProjects)}
      {renderProjectList('Upcoming Projects', upcomingProjects)}
      {renderProjectList('Completed Projects', completedProjects)}
      {renderProjectList('In-Active Projects', inactiveProjects)}
      
      {(!tasks || tasks.length === 0) && (
        <p style={{ color: 'var(--text-muted)' }}>No projects available.</p>
      )}
    </div>
  );
}

export default DashboardView;
