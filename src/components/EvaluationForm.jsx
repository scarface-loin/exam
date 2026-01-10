import React, { useState } from 'react';
import './EvaluationForm.css';

function EvaluationForm({ studentId, addEvaluation, setShowForm }) {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [coefficient, setCoefficient] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (subject.trim() && grade !== '' && coefficient !== '') {
      addEvaluation(studentId, {
        id: Date.now(),
        subject: subject.trim(),
        grade: parseFloat(grade),
        coefficient: parseFloat(coefficient),
      });
      setSubject('');
      setGrade('');
      setCoefficient('');
      setShowForm(false); // Fermer le formulaire après ajout
    } else {
      alert("Veuillez remplir tous les champs.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="evaluation-form">
      <h4>Ajouter une Évaluation</h4>
      <input
        type="text"
        placeholder="Matière"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <input
        type="number"
        step="0.1"
        placeholder="Note (ex: 15.5)"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
      />
      <input
        type="number"
        placeholder="Coefficient"
        value={coefficient}
        onChange={(e) => setCoefficient(e.target.value)}
      />
      <button type="submit">Enregistrer Évaluation</button>
    </form>
  );
}

export default EvaluationForm;