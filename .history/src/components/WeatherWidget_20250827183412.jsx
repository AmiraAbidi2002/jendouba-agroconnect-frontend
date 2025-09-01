<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prévisions Météo Agricole</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        :root {
            --primary-color: #1d4c43;
            --secondary-color: #B8CBD0;
            --accent-color: #e53e3e;
            --text-color: #2d3748;
            --background-color: #ffffff;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            transition: all 0.3s ease;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f8fafc;
            color: #2d3748;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem;
        }
        
        .weather-app {
            background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background-color: var(--primary-color);
            color: white;
            padding: 1.5rem;
            text-align: center;
            border-bottom: 4px solid var(--accent-color);
        }
        
        .main-content {
            display: flex;
            flex-direction: column;
            padding: 1.5rem;
        }
        
        @media (min-width: 768px) {
            .main-content {
                flex-direction: row;
            }
        }
        
        .today-forecast {
            background-color: var(--secondary-color);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            position: relative;
        }
        
        @media (min-width: 768px) {
            .today-forecast {
                width: 35%;
                margin-bottom: 0;
                margin-right: 1.5rem;
            }
        }
        
        .minimize-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(255, 255, 255, 0.3);
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-color);
        }
        
        .minimized .today-details {
            display: none;
        }
        
        .today-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--primary-color);
            text-align: center;
        }
        
        .today-temp {
            font-size: 3.5rem;
            font-weight: 700;
            text-align: center;
            color: var(--text-color);
            margin: 0.5rem 0;
        }
        
        .today-description {
            text-align: center;
            text-transform: capitalize;
            margin-bottom: 1.5rem;
            font-weight: 500;
        }
        
        .today-icon {
            display: flex;
            justify-content: center;
            font-size: 3rem;
            margin-bottom: 1.5rem;
        }
        
        .today-stats {
            display: flex;
            justify-content: space-around;
            margin-top: 1.5rem;
        }
        
        .stat {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .stat i {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }
        
        .advice-section {
            flex: 1;
        }
        
        .advice-item {
            background-color: #FEF2F2;
            border-left: 4px solid var(--accent-color);
            padding: 1.25rem;
            border-radius: 1rem;
            margin-bottom: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .advice-title {
            color: #991B1B;
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
        }
        
        .advice-title i {
            margin-right: 0.5rem;
        }
        
        .advice-text {
            color: #374151;
            font-size: 0.95rem;
        }
        
        .forecast-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 2rem 0 1.5rem;
            text-align: center;
            color: var(--primary-color);
        }
        
        .forecast-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
            margin: 1rem 0 2rem;
        }
        
        .forecast-day {
            background-color: white;
            border-radius: 16px;
            padding: 1.25rem;
            min-width: 120px;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .forecast-day:nth-child(even) {
            background-color: var(--primary-color);
            color: white;
        }
        
        .day-name {
            font-weight: 600;
            font-size: 1rem;
        }
        
        .day-date {
            font-size: 0.8rem;
            margin-bottom: 0.75rem;
        }
        
        .day-temp {
            font-weight: 700;
            font-size: 1.5rem;
            margin: 0.5rem 0;
        }
        
        .day-icon {
            font-size: 2rem;
            margin: 0.5rem 0;
        }
        
        .footer {
            text-align: center;
            padding: 1.5rem;
            background-color: var(--primary-color);
            color: white;
            border-top: 4px solid var(--accent-color);
        }
        
        .temp-0 { color: #1e40af; }
        .temp-10 { color: #2563eb; }
        .temp-20 { color: #16a34a; }
        .temp-30 { color: #ca8a04; }
        .temp-40 { color: #ea580c; }
    </style>
</head>
<body>
    <div class="container">
        <div class="weather-app">
            <div class="header">
                <h1>Prévisions Météo Agricole</h1>
            </div>
            
            <div class="main-content">
                <div class="today-forecast">
                    <button class="minimize-btn" onclick="toggleMinimize()">
                        <i class="fas fa-minus"></i>
                    </button>
                    <h2 class="today-title">Aujourd'hui</h2>
                    <div class="today-details">
                        <div class="today-temp">44°C</div>
                        <div class="today-description">Light Rain</div>
                        <div class="today-icon">
                            <i class="fas fa-cloud-rain"></i>
                        </div>
                        <div class="today-stats">
                            <div class="stat">
                                <i class="fas fa-tint"></i>
                                <span>65%</span>
                            </div>
                            <div class="stat">
                                <i class="fas fa-wind"></i>
                                <span>2.96 m/s</span>
                            </div>
                            <div class="stat">
                                <i class="fas fa-compress-alt"></i>
                                <span>1015 hPa</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="advice-section">
                    <div class="advice-item">
                        <h3 class="advice-title">
                            <i class="fas fa-seedling"></i>
                            Prioritize Harvest
                        </h3>
                        <p class="advice-text">
                            If severe weather is forecast, focus all efforts on harvesting vulnerable, mature crops first to avoid losses.
                        </p>
                    </div>
                    
                    <div class="advice-item">
                        <h3 class="advice-title">
                            <i class="fas fa-shield-alt"></i>
                            Protect Assets
                        </h3>
                        <p class="advice-text">
                            Secure soil (e.g., cover seedbeds) and protect high-value crops with nets or covers from hail/heavy rain. Ensure drainage is clear.
                        </p>
                    </div>
                </div>
            </div>
            
            <h2 class="forecast-title">Prévisions des prochains jours</h2>
            <div class="forecast-container">
                <div class="forecast-day">
                    <div class="day-name">jeu.</div>
                    <div class="day-date">28 août</div>
                    <div class="day-icon">
                        <i class="fas fa-sun"></i>
                    </div>
                    <div class="day-temp temp-20">26°C</div>
                </div>
                
                <div class="forecast-day">
                    <div class="day-name">ven.</div>
                    <div class="day-date">29 août</div>
                    <div class="day-icon">
                        <i class="fas fa-sun"></i>
                    </div>
                    <div class="day-temp temp-20">26°C</div>
                </div>
                
                <div class="forecast-day">
                    <div class="day-name">sam.</div>
                    <div class="day-date">30 août</div>
                    <div class="day-icon">
                        <i class="fas fa-cloud-sun"></i>
                    </div>
                    <div class="day-temp temp-20">27°C</div>
                </div>
                
                <div class="forecast-day">
                    <div class="day-name">dim.</div>
                    <div class="day-date">31 août</div>
                    <div class="day-icon">
                        <i class="fas fa-sun"></i>
                    </div>
                    <div class="day-temp temp-30">33°C</div>
                </div>
                
                <div class="forecast-day">
                    <div class="day-name">lun.</div>
                    <div class="day-date">1 sept.</div>
                    <div class="day-icon">
                        <i class="fas fa-sun"></i>
                    </div>
                    <div class="day-temp temp-40">39°C</div>
                </div>
                
                <div class="forecast-day">
                    <div class="day-name">mar.</div>
                    <div class="day-date">2 sept.</div>
                    <div class="day-icon">
                        <i class="fas fa-sun"></i>
                    </div>
                    <div class="day-temp temp-40">39°C</div>
                </div>
            </div>
            
            <div class="footer">
                <p>Météo Agricole &copy; 2023 - Tous droits réservés</p>
            </div>
        </div>
    </div>

    <script>
        function toggleMinimize() {
            const todayForecast = document.querySelector('.today-forecast');
            const minimizeBtn = document.querySelector('.minimize-btn');
            const icon = minimizeBtn.querySelector('i');
            
            todayForecast.classList.toggle('minimized');
            
            if (todayForecast.classList.contains('minimized')) {
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            } else {
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            }
        }
        
        // Fonction pour déterminer la classe de couleur en fonction de la température
        function getTempClass(temp) {
            if (temp < 0) return 'temp-0';
            if (temp < 10) return 'temp-10';
            if (temp < 20) return 'temp-20';
            if (temp < 30) return 'temp-30';
            return 'temp-40';
        }
        
        // Appliquer les classes de température
        document.querySelectorAll('.day-temp').forEach(el => {
            const temp = parseInt(el.textContent);
            el.classList.add(getTempClass(temp));
        });
    </script>
</body>
</html>