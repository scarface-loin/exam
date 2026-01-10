import React, { useState } from 'react';
import EvaluationForm from './EvaluationForm';
import StudentEvaluations from './StudentEvaluations';
import './StudentItem.css';

function StudentItem({ student, addEvaluation }) {
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);

  return (
    <div className="student-card">
      <h3>{student.name}</h3>
      <button onClick={() => setShowEvaluationForm(!showEvaluationForm)}>
        {showEvaluationForm ? 'Fermer Formulaire' : 'Ajouter Évaluation'}
      </button>

      {showEvaluationForm && (
        <EvaluationForm studentId={student.id} addEvaluation={addEvaluation} setShowForm={setShowEvaluationForm} />
      )}

      <StudentEvaluations evaluations={student.evaluations} />
    </div>
  );
}

export default StudentItem;