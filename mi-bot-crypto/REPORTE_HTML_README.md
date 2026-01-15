# 📊 Reporte HTML de Mercado Crypto

## 🎯 Descripción

Sistema automático para generar reportes HTML con análisis de ganancias y pérdidas del mercado crypto en últimas 24h y 7 días. Incluye:

✅ **Tablas de Ganancias**
- Últimas 24 horas
- Últimos 7 días
- Ranking con 🥇 🥈 🥉

✅ **Tablas de Pérdidas**
- Últimas 24 horas  
- Últimos 7 días
- Ordenadas de mayor a menor caída

✅ **Estadísticas**
- Cantidad de monedas ganando/perdiendo
- Suma total de cambios
- Promedios de cambios

✅ **Análisis de Volatilidad**
- Alto y bajo de la semana
- Porcentaje de volatilidad
- Volumen de trading 24h

✅ **Diseño Responsivo**
- Compatible móvil
- Colores verde (ganancias) y rojo (pérdidas)
- Tablas ordenadas y fáciles de leer

---

## 🚀 Uso Rápido

### Generar reporte una sola vez:
```bash
npm run market-report
```

### Generar reportes automáticamente cada hora:
```bash
npm run market-report-scheduler
```

### Abrir el último reporte generado:
```bash
npm run open-market
```

---

## 📁 Archivos Generados

Los reportes se guardan con timestamp:
```
reporte_mercado_1768501872893.html
reporte_mercado_1768502472891.html
reporte_mercado_1768503072890.html
...
```

Para limpiar reportes antiguos:
```bash
# PowerShell
Remove-Item reporte_mercado_*.html -Exclude reporte_mercado_*.*[0-9].html
```

---

## ⚙️ Configuración

### Intervalo del Scheduler

Edita el archivo `.env`:
```env
REPORT_INTERVAL_MINUTES=60
```

O configura directamente:
```bash
# Ejecutar cada 30 minutos
$env:REPORT_INTERVAL_MINUTES=30; node reporte_html_scheduler.js
```

---

## 📊 Estructura del Reporte

```
┌─ HEADER ─────────────────────┐
│ 📊 Reporte de Mercado Crypto │
└──────────────────────────────┘

┌─ ESTADÍSTICAS ───────────────┐
│ 💹 Ganancias 24h             │
│ 📉 Pérdidas 24h              │
│ 💹 Ganancias 7d              │
│ 📉 Pérdidas 7d               │
│ 📈 Promedio 24h              │
│ 📈 Promedio 7d               │
└──────────────────────────────┘

┌─ TABLAS DE GANANCIAS ────────┐
│ 📈 24h | 📈 7d               │
└──────────────────────────────┘

┌─ TABLAS DE PÉRDIDAS ─────────┐
│ 📉 24h | 📉 7d               │
└──────────────────────────────┘

┌─ VOLATILIDAD ────────────────┐
│ ⚖️ Alto/Bajo 7d              │
│ Volatilidad % | Volumen      │
└──────────────────────────────┘

┌─ FOOTER ─────────────────────┐
│ Timestamp | Disclaimer       │
└──────────────────────────────┘
```

---

## 🎨 Características de Diseño

### Colores
- **Verde (#28a745)**: Ganancias positivas
- **Rojo (#dc3545)**: Pérdidas
- **Morado (#667eea)**: Header y accents

### Responsive
- ✅ Desktop (2 columnas de tablas)
- ✅ Tablet (1-2 columnas)
- ✅ Móvil (1 columna, fuentes ajustadas)

### Interactividad
- Filas resaltadas al pasar mouse
- Tablas con scroll horizontal en móviles
- Totales destacados con fondo especial

---

## 📈 Ejemplo de Salida

```
✅ Reporte guardado: reporte_mercado_1768501872893.html

📊 Resumen:
   Ganancias 24h: 1 monedas (+1.35%)
   Pérdidas 24h:  13 monedas (-39.43%)
   Ganancias 7d:  9 monedas (+32.42%)
   Pérdidas 7d:   5 monedas (-20.68%)
```

---

## 🔗 APIs Utilizadas

- **Binance API** - Datos de precios y velas
  - Endpoint: `https://api.binance.com/api/v3/klines`
  - Intervalo: 1 día (1d)
  - Período: Últimos 7 días
  - Sin autenticación requerida

---

## ⚡ Integración con Otros Scripts

### Junto con el predictor:
```bash
npm run market-report && npm run predict
```

### En un pipeline completo:
```bash
npm run market-report-scheduler &  # Background
npm run predict-scheduler &        # Background
npm start                          # Sentiment bot
```

---

## 🛠️ Troubleshooting

### El reporte no se genera
```
❌ Error: No se pudieron obtener datos
```
**Solución:** Verificar conexión a internet y estado de Binance API

### Reportes antiguos se acumulan
```bash
# Eliminar todos excepto los últimos 5
ls -t reporte_mercado_*.html | tail -n +6 | xargs rm
```

### Scheduler se detiene
Presionaste Ctrl+C. Reinicia con:
```bash
npm run market-report-scheduler
```

---

## 📋 Comparación: Una vez vs Scheduler

| Feature | reporte_html.js | reporte_html_scheduler.js |
|---------|-----------------|---------------------------|
| Ejecuta una sola vez | ✅ | ❌ |
| Ejecuta periódicamente | ❌ | ✅ |
| Ideal para | Test manual | Producción 24/7 |
| Usa intervalo .env | ❌ | ✅ |
| Muestra logs continuos | ❌ | ✅ |

---

## 🎯 Casos de Uso

1. **Monitoreo Diario**
   ```bash
   npm run market-report  # Cada mañana
   ```

2. **Dashboard en Vivo**
   ```bash
   npm run market-report-scheduler  # Actualiza cada hora
   ```

3. **Análisis de Tendencias**
   - Guarda reportes históricos
   - Compara cambios entre horas
   - Identifica patrones

4. **Alertas Personalizadas**
   - Extrae datos del HTML
   - Envía notificaciones si cambios > umbral

---

## 📝 Notas

- Los datos son en tiempo real desde Binance
- El reporte incluye: BTC, ETH, SOL, LINK, AVAX, ADA, DOT, MATIC, LTC, BCH, XLM, XRP, TRX, BNB
- No es asesoramiento financiero
- Use solo para propósitos informativos

---

**Última actualización:** 15 Enero 2026
**Versión:** 1.0
