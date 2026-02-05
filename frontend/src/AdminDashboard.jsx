import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, RefreshCw, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        const token = sessionStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [statsRes, reviewsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/stats`, config),
                axios.get(`${API_BASE_URL}/reviews`, config)
            ]);
            setStats(statsRes.data);
            setReviews(reviewsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                sessionStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('username');
        navigate('/login');
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta encuesta?')) return;

        const token = sessionStorage.getItem('token');
        try {
            await axios.delete(`${API_BASE_URL}/reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Error al eliminar la encuesta');
        }
    };

    const chartData = stats ? [
        { name: 'Atención', yes: stats.q1, no: stats.total - stats.q1 },
        { name: 'Recomienda', yes: stats.q2, no: stats.total - stats.q2 },
        { name: 'Rapidez', yes: stats.q3, no: stats.total - stats.q3 },
        { name: 'Limpieza', yes: stats.q4, no: stats.total - stats.q4 },
    ] : [];

    const handlePrint = () => {
        window.print();
    };

    const surveyUrl = window.location.origin;

    if (loading) return <div className={styles.adminContainer}>Cargando panel...</div>;

    return (
        <div className={styles.adminContainer}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Panel de Administración </h1>
                    <p style={{ color: '#718096', fontSize: '0.9rem' }}>Hola, {sessionStorage.getItem('username')}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={fetchData} className={styles.printBtn} style={{ background: '#3182ce' }}>
                        <RefreshCw size={18} /> Actualizar
                    </button>
                    <button onClick={handleLogout} className={styles.printBtn} style={{ background: '#e53e3e' }}>
                        <LogOut size={18} /> Salir
                    </button>
                </div>
            </header>

            <div className={styles.dashboardGrid}>
                {/* Gráfico de Barras Apiladas */}
                <div className={styles.card} style={{ gridColumn: 'span 2' }}>
                    <h2>Resumen de Respuestas</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="yes" stackId="a" fill="#48bb78" name="Sí" />
                                <Bar dataKey="no" stackId="a" fill="#fc8181" name="No" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Configuración de Impresión / QR */}
                <div className={styles.card}>
                    <h2>Configuración de Impresión</h2>
                    <div className={styles.qrSection}>
                        <p>QR para que el cliente escanee:</p>
                        <div className={styles.qrContainer}>
                            <QRCodeSVG value={surveyUrl} size={150} />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#718096' }}>{surveyUrl}</p>
                        <button onClick={handlePrint} className={styles.printBtn}>
                            <Printer size={18} /> Imprimir QR
                        </button>
                    </div>
                </div>
            </div>

            {/* Historial de Respuestas */}
            <div className={styles.card}>
                <h2>Historial de Respuestas ({stats?.total || 0})</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table className={styles.historyTable}>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Q1</th>
                                <th>Q2</th>
                                <th>Q3</th>
                                <th>Q4</th>
                                <th>Comentario</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((r) => (
                                <tr key={r.id}>
                                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                                    <td><span className={`${styles.badge} ${r.q1 ? styles.badgeYes : styles.badgeNo}`}>{r.q1 ? 'Sí' : 'No'}</span></td>
                                    <td><span className={`${styles.badge} ${r.q2 ? styles.badgeYes : styles.badgeNo}`}>{r.q2 ? 'Sí' : 'No'}</span></td>
                                    <td><span className={`${styles.badge} ${r.q3 ? styles.badgeYes : styles.badgeNo}`}>{r.q3 ? 'Sí' : 'No'}</span></td>
                                    <td><span className={`${styles.badge} ${r.q4 ? styles.badgeYes : styles.badgeNo}`}>{r.q4 ? 'Sí' : 'No'}</span></td>
                                    <td style={{ fontSize: '0.9rem' }}>{r.comment || '-'}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDeleteReview(r.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#e53e3e',
                                                cursor: 'pointer',
                                                padding: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Eliminar encuesta"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Elemento oculto solo para impresión */}
            <div className={styles.printOnly}>
                <h1>Escanéame para darnos tu opinión</h1>
                <QRCodeSVG value={surveyUrl} size={300} includeMargin={true} />
                <p>{surveyUrl}</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
