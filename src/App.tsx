import React, { useState } from 'react';
import ProjectManagement from './components/ProjectManagement';
import { useDatabaseData } from './hooks/useDatabaseData';

function App() {
  const {
    members,
    projects,
    externalPartners,
    labels,
    calendarEvents,
    vehicles,
    isLoading,
    isDatabaseConnected,
    updateMembers,
    updateProjects,
    updateExternalPartners,
    updateVehicles,
    createLabel,
    updateLabel,
    deleteLabel,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  } = useDatabaseData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <ProjectManagement
        projects={projects}
        members={members}
        externalPartners={externalPartners}
        labels={labels}
        calendarEvents={calendarEvents}
        vehicles={vehicles}
        onUpdateProjects={updateProjects}
        onUpdateMembers={updateMembers}
        onUpdateExternalPartners={updateExternalPartners}
        onUpdateVehicles={updateVehicles}
        onCreateLabel={createLabel}
        onUpdateLabel={updateLabel}
        onDeleteLabel={deleteLabel}
        onCreateCalendarEvent={createCalendarEvent}
        onUpdateCalendarEvent={updateCalendarEvent}
        onDeleteCalendarEvent={deleteCalendarEvent}
        isDatabaseConnected={isDatabaseConnected}
      />
    </div>
  );
}

export default App;