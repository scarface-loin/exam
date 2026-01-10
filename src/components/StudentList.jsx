import React, { useState } from 'react';
import StudentItem from './StudentItem';
import './StudentList.css';

function StudentList({ students, addStudent, addEvaluation }) {
  const [newStudentName, setNewStudentName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newStudentName.trim()) {
      addStudent(newStudentName.trim());
      setNewStudentName('');
    }
  };

  return (
    <div className="student-list-container">
      <h2>Liste des Étudiants</h2>
      <form onSubmit={handleSubmit} className="add-student-form">
        <input
          type="text"
          placeholder="Nom de l'étudiant"
          value={newStudentName}
          onChange={(e) => setNewStudentName(e.target.value)}
        />
        <button type="submit">Ajouter Étudiant</button>
      </form>
      <div className="students-grid">
        {students.map(student => (
          <StudentItem key={student.id} student={student} addEvaluation={addEvaluation} />
        ))}
      </div>
    </div>
  );
}

export default StudentList;