# EATED

App personal de calorías y macros (PWA). Sin servidor ni base de datos: todo queda guardado en el iPhone.

## Publicar en Vercel
1. Crea un repo en GitHub (ej. `eated`) y sube esta carpeta tal cual.
2. En vercel.com → Add New → Project → importa el repo → Framework: **Other** → Deploy (sin build).
3. Abre la URL en **Safari** del iPhone → Compartir → **Agregar a pantalla de inicio**.

## Actualizar
Haz push al repo. Si cambias archivos, sube la versión en `sw.js` (`VERSION`) para que el iPhone tome los cambios.

## Datos
- Exporta un respaldo desde Ajustes → Respaldo (archivo .json). Para cambiar de iPhone: Importar.
- Alimentos: base genérica local (`js/foods.js`), Open Food Facts (productos y código de barras), USDA (opcional).
- Platos caseros: Agregar → Pegar de Claude (formato en Ajustes → Copiar instrucciones para Claude).
