# Laboratorio 1 - Cloud Computing

Jefferson Andres Espejo Goez
UdeA, 2026

Opción elegida: Next.js en Vercel.

## Entregables

URL pública: https://my-next-lab-eta.vercel.app/

Repositorio: https://github.com/AndiEspejo/my-next-lab

Captura del home: `docs/home.png`

El proyecto es una app de Next.js 16 con App Router, TypeScript y Tailwind, creada con `create-next-app` y conectada a Vercel desde GitHub.

## Proveedor, razones y costos

Elegí Vercel porque es la plataforma que mantiene Next.js, así que el build lo detecta solo y no tuve que escribir configuración de infraestructura. Conecté el repositorio y en el primer intento ya tenía la URL funcionando con HTTPS.

La segunda razón fue el despliegue automático. Cada push a `main` dispara un build nuevo, que es justo lo que pide el checklist del laboratorio. No tuve que montar un pipeline aparte.

También pesó el costo. El plan Hobby es gratis para uso personal, no pide tarjeta y no deja recursos encendidos que se me olviden apagar. La otra opción del laboratorio, WordPress en Lightsail, cobra desde la primera hora de instancia aunque nadie visite el sitio.

Costos de este laboratorio: cero. El plan Hobby, el subdominio `.vercel.app`, el certificado TLS y el repositorio público en GitHub no tienen costo.

Si el proyecto creciera, los costos serían estos. El plan Pro cuesta alrededor de 20 dólares por usuario al mes y aplica si el uso deja de ser personal. Un dominio propio cuesta entre 10 y 15 dólares al año en el registrador, aunque Vercel no cobra por conectarlo. Para comparar, la instancia más básica de Lightsail cuesta unos 5 dólares al mes. Estas cifras son las publicadas al momento de la entrega y conviene revisarlas en vercel.com/pricing.

## Validación

- [x] El sitio carga en el navegador y en modo incógnito
- [x] Un commit nuevo en `main` produce un cambio visible en producción
- [x] HTTPS activo
- [ ] Dominio personalizado (opcional, no lo hice)

Para poder demostrar el segundo punto puse en la página el hash del commit que Vercel desplegó. Lo leo de las variables que Vercel inyecta en cada build: `VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_MESSAGE` y `VERCEL_ENV`.

Después del primer deploy la página mostraba el commit `5ce75bd` con la versión v1. Hice un push del segundo commit y unos 16 segundos después la misma URL ya mostraba `016bf74` con la versión v2. Lo único que hice entre un estado y el otro fue `git push`.

La captura en `docs/home.png` corresponde al commit `016bf74`. Como cada push vuelve a desplegar, la URL en vivo puede mostrar un hash posterior al de la imagen.

Para verificar el HTTPS:

```
$ curl -s -o /dev/null -w "%{http_code} %{scheme}\n" https://my-next-lab-eta.vercel.app/
200 HTTPS
```

## Preguntas de reflexión

### 1. ¿Qué modelo de servicio usaste?

PaaS, y por debajo funciona con un modelo serverless.

No administro sistema operativo, ni servidor web, ni parches, así que no es IaaS. Tampoco estoy usando un software terminado de un tercero, así que no es SaaS. Yo entrego el código y la plataforma se encarga de compilarlo y publicarlo, que es lo que define a PaaS.

Vale la pena aclarar cómo se ejecuta. Las páginas que se prerenderizan durante el build quedan como archivos estáticos y se sirven desde el CDN, sin que haya un servidor involucrado en cada visita. Las partes dinámicas se empaquetan como funciones serverless que se levantan cuando llega una petición y se apagan al terminar. No hay un proceso encendido esperando tráfico, y por eso el costo base es cero: se paga por uso y no por capacidad reservada. Lightsail es lo contrario, ahí se paga por hora de instancia encendida.

### 2. ¿Qué ventajas y limitaciones viste?

Lo que más me sirvió fue lo rápido que se llega a producción. De crear el proyecto a tener una URL con HTTPS pasaron minutos y no escribí nada de configuración. También está bueno que cada rama genere su propio preview con URL aparte, y que se pueda volver a un deploy anterior sin reconstruir nada porque cada build queda guardado.

Las limitaciones también se notan. Hay bastante acoplamiento al proveedor: cosas como ISR, el middleware en el edge o la optimización de imágenes son implementaciones de Vercel, y aunque el código sigue siendo Next.js estándar, reproducir ese comportamiento en otro lado da trabajo.

No hay acceso al sistema operativo ni forma de ajustar la infraestructura, lo cual es cómodo hasta que se necesita algo que la plataforma no expone. Y el modelo serverless tiene límites propios: hay tope de duración por invocación, así que no sirve para procesos largos ni para conexiones persistentes. Las funciones sin tráfico reciente además tienen arranque en frío y la primera petición sale más lenta.

Otra cosa que hay que tener presente es que Vercel no da base de datos ni almacenamiento persistente, eso se contrata y se paga aparte. Y el plan gratuito es solo para uso personal, cualquier uso comercial obliga a pagar.

Me pasó un caso concreto que ilustra el punto de las limitaciones. Al principio quería mostrar la región desde donde se sirve la página usando `VERCEL_REGION`, pero siempre salía vacío. La razón es que esa variable solo existe en tiempo de ejecución dentro de una función, y mi página se prerenderiza durante el build, cuando todavía no hay ninguna petición. Terminé usando `VERCEL_ENV`, que sí está disponible en el build.

### 3. ¿Cómo escalarías la app si crece el tráfico?

El cómputo ya escala solo: el CDN absorbe lo estático y las funciones se instancian en paralelo según la demanda. El trabajo real está en lo que viene detrás.

Lo primero sería cachear todo lo posible, prerenderizando lo que no sea específico de cada usuario y usando ISR con revalidación en vez de renderizado dinámico. Cada respuesta que sale de la caché es una función que no se ejecuta, así que baja la latencia y baja el costo al mismo tiempo.

Lo segundo es proteger la base de datos, que es el cuello de botella real. Si mil funciones se ejecutan al tiempo, cada una intenta abrir su conexión y el pool se agota. La solución es un pooler tipo PgBouncer o un driver serverless que hable por HTTP.

Después sacaría de la petición todo lo que no necesita responderle al usuario, como envíos de correo o procesamiento de imágenes, y lo movería a una cola. También agregaría una caché de datos como Redis para las consultas repetidas y costosas, y pondría rate limiting para que un pico raro no se convierta en gasto.

Sobre todo, mediría antes de decidir. Sin métricas de caché, latencia y duración de funciones, escalar es adivinar.

Si en algún momento la app deja de encajar en el modelo serverless, por ejemplo por procesos largos o carga sostenida, la migración natural sería a contenedores en algo como Cloud Run o ECS, dejando el CDN adelante.

### 4. ¿Qué harías para estimar y controlar costos?

Para estimar, primero hay que entender qué cobra el proveedor. En Vercel no se paga por servidor sino por ancho de banda, invocaciones y duración de funciones, minutos de build y transformaciones de imagen. Con eso claro se puede proyectar: visitas al mes por peso de la página da el ancho de banda, y peticiones dinámicas por duración promedio da el cómputo. A eso hay que sumarle lo que no viene incluido, como la base de datos y el dominio.

Para controlar, lo primero que configuraría es una alerta de gasto. Vercel tiene Spend Management, que avisa y puede pausar el proyecto al llegar a un límite; en AWS el equivalente es AWS Budgets. Eso se configura el primer día, no el día de la factura sorpresa.

Después, cachear agresivamente, que es la palanca de mayor efecto porque baja latencia, invocaciones y ancho de banda al mismo tiempo. Revisaría el consumo cada semana mirando la tendencia y no solo el total, y separaría ambientes para saber si el gasto viene de producción o de los previews.

También hay que apagar lo que no se usa: ramas viejas con previews activos, proyectos abandonados, recursos de prueba. En este laboratorio eso significa borrar el proyecto cuando termine.

Por último, presupuestaría pensando en el peor caso y no en el promedio. Un pico de tráfico o un bucle accidental en una función se paga igual, y un límite duro de gasto sale más barato que un incidente.

## Limpieza

Si no sigo usando el proyecto:

1. Vercel, en Project > Settings > Delete Project
2. GitHub, borrar el repositorio (opcional)

No quedan recursos facturables activos porque el plan Hobby no reserva capacidad.
