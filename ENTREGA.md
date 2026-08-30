# Laboratorio 1 — Cloud Computing (UdeA, 2026)

**Estudiante:** Andi Espejo
**Opción elegida:** Next.js en Vercel (Jamstack / desarrolladores)

---

## 1. Entregables

| Ítem | Valor |
| --- | --- |
| URL pública | https://my-next-lab-eta.vercel.app/ |
| Repositorio | https://github.com/AndiEspejo/my-next-lab |
| Captura del home | `docs/home.png` |
| Framework | Next.js 16 (App Router, TypeScript, Tailwind CSS 4) |

---

## 2. Nota breve: proveedor, razones y costos

### Proveedor elegido

**Vercel**, sobre un repositorio alojado en GitHub.

### Razones

1. **Integración nativa con Next.js.** Vercel mantiene el framework, así que el
   build se detecta solo: no hay que escribir `Dockerfile`, ni pipeline de CI, ni
   configurar un servidor web. El tiempo se invierte en la aplicación, no en la
   infraestructura.
2. **Despliegue continuo desde Git.** Cada push a `main` dispara un build y un
   despliegue a producción; cada rama o pull request genera un *preview
   deployment* con URL propia. Esto cubre directamente el ítem del checklist
   "hay un cambio visible tras un nuevo commit".
3. **HTTPS y CDN global sin configuración.** El certificado TLS del dominio
   `*.vercel.app` se emite y renueva automáticamente, y los archivos estáticos se
   sirven desde una red de distribución global.
4. **Costo cero y sin tarjeta para el alcance del laboratorio.** A diferencia de
   AWS Lightsail, que factura desde la primera hora de instancia encendida, aquí
   no hay recursos que apagar ni riesgo de cargos por olvido.
5. **Reversibilidad.** Al ser una aplicación Next.js estándar en un repositorio
   propio, migrar a AWS Amplify, Azure Static Web Apps o a un contenedor propio
   implica cambiar el destino del deploy, no reescribir la aplicación.

### Costos estimados

| Concepto | Costo en este laboratorio |
| --- | --- |
| Plan Vercel Hobby | **USD 0 / mes** |
| Dominio `*.vercel.app` | Incluido, USD 0 |
| Certificado TLS | Incluido, USD 0 |
| Repositorio público en GitHub | USD 0 |
| **Total** | **USD 0** |

El plan Hobby es gratuito para uso personal y no comercial, e incluye cuotas
mensuales de ancho de banda, invocaciones de funciones y minutos de build más que
suficientes para un sitio de una página. Los excedentes no se facturan de forma
automática: el proyecto se pausa o se solicita una ampliación.

Escenarios con costo, para dimensionar:

- **Uso comercial o equipo:** plan Pro, aproximadamente **USD 20 por usuario al
  mes**, más consumo por encima de las cuotas incluidas.
- **Dominio propio:** entre **USD 10 y 15 al año** en el registrador (Namecheap,
  Route 53, GoDaddy). Vercel no cobra por conectarlo.
- **Comparación con la opción Lightsail** del mismo laboratorio: la instancia más
  básica cuesta del orden de **USD 5 al mes**, se cobre o no tráfico, mientras la
  instancia siga encendida.

> Las cifras corresponden a los planes publicados al momento de la entrega y
> conviene verificarlas en https://vercel.com/pricing antes de citarlas.

---

## 3. Checklist de validación

- [x] El sitio carga en el navegador y en modo incógnito.
- [x] Un nuevo commit en `main` produce un cambio visible en la URL de producción.
- [x] HTTPS activo (automático en el dominio `*.vercel.app`).
- [ ] (Opcional) Dominio personalizado configurado. — no se realizó.

### Evidencia del despliegue continuo

La página muestra en pantalla el hash del commit desplegado, leído de las
variables de entorno que Vercel inyecta en cada build
(`VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_MESSAGE`, `VERCEL_ENV`). Comparando
el valor visible antes y después de un push se prueba que el despliegue se
disparó solo, sin intervención manual:

| Momento | Commit visible en producción | Versión |
| --- | --- | --- |
| Después del primer deploy | `5ce75bd` | v1 |
| ~16 s después de `git push` del segundo commit | `016bf74` | v2 |

El único acto humano entre ambos estados fue `git push`. No hubo build manual,
ni subida de archivos, ni reinicio de servidor.

**Nota sobre la captura.** `docs/home.png` congela el estado del commit
`016bf74`. Como cada push a `main` vuelve a desplegar, la URL en vivo mostrará el
hash del último commit del repositorio, que puede ser posterior al de la imagen.
Esa diferencia no es un error: es precisamente el comportamiento que el
laboratorio pide demostrar.

### Verificación de HTTPS

```
$ curl -s -o /dev/null -w "%{http_code} %{scheme}\n" https://my-next-lab-eta.vercel.app/
200 HTTPS
```

---

## 4. Preguntas de reflexión

### 4.1 ¿Qué modelo de servicio usaste?

**PaaS, con un modelo de ejecución serverless por debajo.**

El límite es claro: no administro sistema operativo, ni servidor web, ni
parches, ni balanceadores — eso descarta IaaS. Tampoco consumo software
terminado de un tercero — eso descarta SaaS. Entrego código fuente y la
plataforma se encarga de compilarlo, distribuirlo y ejecutarlo: eso es PaaS.

La precisión importante es *cómo* se ejecuta. En este proyecto conviven dos
modos:

- Las páginas prerenderizadas en tiempo de build se sirven como archivos
  estáticos desde el CDN. No hay servidor involucrado en cada visita.
- Las funciones de servidor (Route Handlers, Server Actions, renderizado
  dinámico) se empaquetan como **funciones serverless**: se instancian cuando
  llega una petición y se apagan al terminar. No existe un proceso encendido
  esperando tráfico.

De ahí que el costo base sea cero: no se paga por capacidad reservada, se paga
por uso. Es exactamente lo contrario del modelo de la opción Lightsail del mismo
laboratorio, que es IaaS y factura por hora de instancia encendida,
independientemente de si alguien visita el sitio.

### 4.2 ¿Qué ventajas y limitaciones viste en ese proveedor?

**Ventajas**

- **Tiempo hasta producción medido en minutos.** Del `create-next-app` a una URL
  pública con HTTPS sin escribir configuración de infraestructura.
- **Preview deployments por rama.** Cada pull request obtiene un entorno
  desechable con URL propia; se revisa el cambio funcionando, no el diff.
- **Rollback inmediato.** Cada despliegue es inmutable y queda en el historial;
  volver a una versión anterior es promover un build existente, no reconstruir.
- **HTTPS, CDN y optimización de imágenes por defecto**, sin configuración.
- **Variables de entorno por ambiente** (Production, Preview, Development) desde
  la interfaz, sin secretos en el repositorio.

**Limitaciones**

- **Acoplamiento al proveedor.** Las capacidades más cómodas (ISR, middleware en
  el edge, optimización de imágenes, analítica) son implementaciones de Vercel.
  El código sigue siendo Next.js estándar, pero reproducir ese comportamiento
  fuera de Vercel exige trabajo adicional.
- **Poco control sobre la infraestructura.** No hay acceso al sistema operativo,
  ni elección de instancia, ni ajuste fino de red. Eso es una ventaja hasta que
  se necesita algo que la plataforma no expone.
- **Restricciones del modelo serverless.** Hay límite de duración por invocación
  y de tamaño del bundle de la función. No es un lugar para procesos largos,
  trabajos por lotes ni conexiones persistentes tipo WebSocket de larga vida.
- **Arranques en frío.** Una función sin tráfico reciente agrega latencia en la
  primera petición.
- **Sin estado propio.** Vercel no aporta base de datos ni sistema de archivos
  persistente en el runtime de la función: la persistencia se contrata aparte y
  se paga aparte.
- **El plan gratuito es para uso personal y no comercial.** Cualquier uso
  productivo real obliga a pasar a un plan pago.

### 4.3 ¿Cómo escalarías tu app si crece el tráfico?

El escalamiento horizontal del cómputo ya viene resuelto: el CDN absorbe el
contenido estático y las funciones serverless se instancian en paralelo según la
demanda. El trabajo real está en no romper lo que hay detrás.

Por orden de impacto:

1. **Mover trabajo hacia la caché.** Prerenderizar todo lo que no sea específico
   del usuario y usar ISR con `revalidate` en lugar de renderizado dinámico. Cada
   respuesta servida desde caché es una invocación de función que no ocurre: baja
   la latencia y baja la factura al mismo tiempo.
2. **Proteger la base de datos.** Este es el cuello de botella real. Mil
   funciones concurrentes intentan abrir mil conexiones y agotan el pool antes de
   que la plataforma se inmute. La solución es un *pooler* (PgBouncer, Prisma
   Accelerate, Neon o Supabase con pooling) o un driver serverless sobre HTTP.
3. **Sacar de la ruta crítica lo que no debe responder al usuario.** Envíos de
   correo, procesamiento de imágenes, webhooks: a una cola o a un job programado,
   no dentro de la petición.
4. **Añadir capas de caché de datos.** Redis administrado (Upstash) para
   respuestas costosas y consultas repetidas.
5. **Poner límites.** Rate limiting por IP o por usuario y protección contra bots,
   para que un pico anómalo no se traduzca en gasto.
6. **Medir antes de decidir.** Métricas de Core Web Vitals, tasa de aciertos de
   caché, duración de funciones y latencia de base de datos. Escalar sin datos es
   adivinar.

Si la aplicación deja de encajar en el modelo serverless — procesos largos,
cargas de trabajo sostenidas, requisitos de residencia de datos — la migración
natural es a contenedores (AWS ECS/Fargate, Cloud Run) manteniendo el CDN al
frente.

### 4.4 ¿Qué harías para estimar y controlar costos?

**Estimar, antes de desplegar**

- Identificar las unidades que el proveedor factura. En Vercel: ancho de banda,
  invocaciones y duración de funciones, minutos de build, transformaciones de
  imagen. Ese es el modelo mental correcto, no "cuánto cuesta el servidor".
- Proyectar volumen: visitas mensuales × peso de la página = ancho de banda;
  peticiones dinámicas × duración media = cómputo.
- Calcular sobre la calculadora oficial del proveedor y sumar aparte lo que no
  incluye: base de datos, dominio, servicios de terceros.

**Controlar, una vez en producción**

- **Alertas de consumo y límites de gasto.** Vercel ofrece *Spend Management* con
  notificación y pausa automática al alcanzar un umbral. En AWS, el equivalente
  es AWS Budgets con alarma en CloudWatch. Configurarlo el primer día, no el día
  de la factura sorpresa.
- **Cachear agresivamente.** Es la palanca de mayor efecto: reduce
  simultáneamente latencia, invocaciones y ancho de banda.
- **Revisar el consumo cada semana** en el panel de uso, buscando la tendencia y
  no solo el total.
- **Etiquetar y separar ambientes** para saber si el gasto viene de producción o
  de previews.
- **Apagar lo que no se usa.** Ramas viejas con previews activos, proyectos
  abandonados, recursos de prueba. En este laboratorio, eso significa borrar el
  proyecto al terminar si no se seguirá usando.
- **Presupuestar el peor caso, no el promedio.** Un pico de tráfico o un bucle
  accidental en una función se paga igual. Un límite duro de gasto es más barato
  que un incidente.

---

## 5. Limpieza

Si el proyecto no se seguirá usando:

1. Vercel → Project → Settings → Delete Project.
2. GitHub → Settings → Delete this repository (opcional).

No quedan recursos facturables activos: el plan Hobby no reserva capacidad.
