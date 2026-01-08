# 📊 Crypto Prediction Report

Un dashboard moderno y elegante para visualizar el historial de predicciones del bot de criptomonedas.

## 🚀 Características

- **Dashboard Interactivo**: Visualización completa del historial de predicciones
- **Estadísticas en Tiempo Real**: Métricas clave del rendimiento del bot
- **Análisis de Tendencias**: Ranking de monedas más consistentes
- **Diseño Moderno**: Interfaz atractiva con gradientes y animaciones
- **Responsive**: Funciona en desktop y móvil
- **Auto-actualización**: Sugerencia de recarga cada 5 minutos

## 📈 Métricas Mostradas

- **Predicciones Totales**: Número total de análisis realizados
- **Tasa de Éxito**: Porcentaje de predicciones exitosas
- **Monedas Analizadas**: Total de criptomonedas evaluadas
- **Monedas en Ranking**: Número de monedas con puntuaciones destacadas

## 🎯 Análisis de Tendencias

- **Ranking por Frecuencia**: Monedas que aparecen más en predicciones exitosas
- **Puntuaciones Promedio**: Score promedio de cada moneda
- **Mejor Puntuación**: Puntaje máximo alcanzado por cada moneda
- **Insights Automáticos**: Observaciones clave del análisis

## 🛠️ Uso

### Flujo Completo Automático (Recomendado)
```bash
npm run full-report
```
**Ejecuta automáticamente:**
1. `predict` - Análisis de predicción completo
2. `predictor_single` - Ejecución única para historial
3. `generate-report` - Generación del reporte HTML
4. `open-report` - Apertura automática en navegador

### Comandos Individuales
```bash
# Generar el reporte HTML (preserva CSS existente)
npm run generate-report

# Regenerar completamente el CSS (sobrescribe cambios)
npm run regenerate-css

# Abrir directamente en el navegador
npm run open-report
```

### Flujo Manual
```bash
# 1. Ejecutar predicciones
npm run predict-scheduler

# 2. Generar reporte HTML
npm run generate-report

# 3. Abrir en navegador
npm run open-report
```

## 🎨 Personalización CSS

**Los cambios en `styles.css` se preservan automáticamente.** El generador no sobrescribe el CSS existente para permitir personalizaciones.

- ✅ **Cambios manuales**: Se mantienen entre regeneraciones
- 🔄 **Actualizar CSS**: Usa `npm run regenerate-css` para forzar actualización
- 🎯 **Edición segura**: Modifica `styles.css` sin miedo a perder cambios

## 🎨 Diseño

- **Contenedor Principal**: Todo el contenido está dentro de un recuadro elegante con borde azul
- **Gradientes Modernos**: Uso de gradientes en headers y elementos interactivos
- **Iconos FontAwesome**: Iconografía consistente y profesional
- **Animaciones Suaves**: Transiciones elegantes en hover
- **Paleta de Colores**: Azul primario, verde para éxito, naranja para advertencias

## 📱 Responsive

El diseño se adapta automáticamente a diferentes tamaños de pantalla:
- **Desktop**: Layout de 2 columnas para secciones principales
- **Tablet**: Ajustes automáticos de grid
- **Móvil**: Diseño de columna única con elementos optimizados

## 🔄 Actualización Automática

El reporte incluye JavaScript para sugerir recarga automática cada 5 minutos, manteniendo los datos actualizados sin intervención manual.

## 📋 Archivos Generados

- `prediction_report.html`: Dashboard principal
- `styles.css`: Estilos modernos y responsive

## ⚡ Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Gradientes, flexbox, grid, animaciones
- **Font Awesome**: Iconografía vectorial
- **Google Fonts**: Tipografía Inter (fallback system fonts)

---

**💡 Tip**: Ejecuta `npm run generate-report` después de cada ciclo de predicciones para mantener el dashboard actualizado.