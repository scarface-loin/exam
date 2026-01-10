import React from 'react';
import './StudentEvaluations.css';

function StudentEvaluations({ evaluations }) {
  // Calcul de la note moyenne pondérée
  const calculateAverage = () => {
    if (evaluations.length === 0) {
      return 'N/A';
    }

    let totalWeightedGrades = 0;
    let totalCoefficients = 0;

    evaluations.forEach(evalItem => {
      totalWeightedGrades += evalItem.grade * evalItem.coefficient;
      totalCoefficients += evalItem.coefficient;
    });

    return (totalWeightedGrades / totalCoefficients).toFixed(2);
  };

  return (
    <div className="student-evaluations-container">
      <h5>Évaluations</h5>
      {evaluations.length > 0 ? (
        <ul>
          {evaluations.map(evalItem => (
            <li key={evalItem.id}>
              {evalItem.subject}: {evalItem.grade} (Coeff: {evalItem.coefficient})
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune évaluation ajoutée.</p>
      )}
      <p className="average-grade">
        Moyenne Générale: <strong>{calculateAverage()}</strong>
      </p>
    </div>
  );
}

export default StudentEvaluations;