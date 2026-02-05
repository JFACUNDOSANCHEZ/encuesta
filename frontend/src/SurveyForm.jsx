import React, { useState } from 'react';
import axios from 'axios';
import { ThumbsUp, ThumbsDown, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './SurveyForm.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const questions = [
    { id: 'q1', text: '¿Está satisfecho con la atención recibida?' },
    { id: 'q2', text: '¿Recomendaría nuestros servicios?' },
    { id: 'q3', text: '¿La resolución fue rápida?' },
    { id: 'q4', text: '¿Las instalaciones estaban limpias?' },
];

const SurveyForm = () => {
    const [formData, setFormData] = useState({
        q1: null,
        q2: null,
        q3: null,
        q4: null,
        comment: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOptionChange = (id, value) => {
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Check if all questions are answered
        const unanswered = questions.some(q => formData[q.id] === null);
        if (unanswered) {
            alert('Por favor responde todas las preguntas de Sí/No');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/reviews`, formData);
            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting survey:', error);
            alert('Hubo un error al enviar la encuesta. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className={styles.container}>
                <div className={styles.successMessage}>
                    <h2>¡Muchas gracias!</h2>
                    <p>Tu opinión es muy importante para nosotros.</p>
                    <button
                        className={styles.submitBtn}
                        style={{ marginTop: '2rem' }}
                        onClick={() => window.location.reload()}
                    >
                        Enviar otra respuesta
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Encuesta de Satisfacción</h1>
                <p>Ayúdanos a mejorar contándonos tu experiencia.</p>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
                {questions.map((q) => (
                    <div key={q.id} className={styles.questionGroup}>
                        <label className={styles.questionLabel}>{q.text}</label>
                        <div className={styles.options}>
                            <div
                                className={`${styles.option} ${formData[q.id] === true ? styles.optionActive : ''}`}
                                onClick={() => handleOptionChange(q.id, true)}
                            >
                                <ThumbsUp size={24} style={{ marginRight: '8px' }} /> Sí
                            </div>
                            <div
                                className={`${styles.option} ${formData[q.id] === false ? styles.optionActive : ''}`}
                                onClick={() => handleOptionChange(q.id, false)}
                            >
                                <ThumbsDown size={24} style={{ marginRight: '8px' }} /> No
                            </div>
                        </div>
                    </div>
                ))}

                <div className={styles.textareaGroup}>
                    <label className={styles.questionLabel}>Comentarios adicionales (opcional):</label>
                    <textarea
                        className={styles.textarea}
                        value={formData.comment}
                        onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                        placeholder="Escribe aquí tus comentarios..."
                    />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Encuesta'}
                </button>
            </form>

            <footer style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Link to="/login" className={styles.adminLink}>
                    <Settings size={14} /> Acceso Personal
                </Link>
            </footer>
        </div>
    );
};

export default SurveyForm;
