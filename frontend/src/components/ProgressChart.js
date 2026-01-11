import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProgressChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        Pas encore de données à afficher
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    }),
    datasets: [
      {
        label: 'Candidatures',
        data: data.map(d => d.applied || 0),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#3B82F6',
      },
      {
        label: 'Entretiens',
        data: data.map(d => d.interview || 0),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#F59E0B',
      },
      {
        label: 'Offres',
        data: data.map(d => d.offer || 0),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#10B981',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Manrope, sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: {
          family: 'Plus Jakarta Sans, sans-serif',
          size: 13
        },
        bodyFont: {
          family: 'Manrope, sans-serif',
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Manrope, sans-serif',
            size: 11
          },
          color: '#64748B'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#E2E8F0',
          drawBorder: false
        },
        ticks: {
          stepSize: 1,
          font: {
            family: 'Manrope, sans-serif',
            size: 11
          },
          color: '#64748B'
        }
      }
    }
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ProgressChart;
