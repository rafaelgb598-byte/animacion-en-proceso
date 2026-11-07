# Despiece 01 · Fuentes

Verificadas el 2026-11-07. La fuente puede estar en inglés; el video no.

## 1. Wikipedia · «Pin tumbler lock» — https://en.wikipedia.org/wiki/Pin_tumbler_lock (consultada, HTTP 200)
Sección *Design* (y el párrafo de entrada):
- La cerradura tiene una **carcasa exterior** fija y un **rotor** (*plug*) que gira, con la bocallave. → «Adentro, un cilindro tiene que girar» · etiquetas CARCASA y ROTOR.
- En el rotor hay agujeros con **pernos de largos variables** (*key pins «of various lengths»*); sobre cada uno hay un **contraperno** (*driver pin*) empujado por un **resorte**. → «columnas de pernos con resortes» · «partida en dos, a una altura distinta» · etiquetas PERNO, CONTRAPERNO, RESORTES.
- El límite entre rotor y carcasa es la **línea de corte** (*shear point / shear line*). **Sin llave**, los resortes empujan los contrapernos y los pernos quedan **cruzando** esa línea, y el rotor no puede girar. → animación de 0–15 s.
- Con la **llave correcta**, los dientes levantan cada columna hasta que la unión perno/contraperno queda **justo en la línea de corte**, y el rotor gira. → «solo sube cada columna a la altura justa» · «cuando todos los cortes tocan esta línea, el cilindro queda libre».
- Con una **llave incorrecta**, los pernos no se alinean con la línea de corte y el rotor no gira (lo dice explícitamente). Que **alcanza con una sola columna** está implícito en la explicación y reforzado en *Vulnerabilities*: una columna mal ubicada impide abrir. → «basta una sola columna corrida y no gira».
- **Cantidad de columnas:** dice que los agujeros del rotor son «típicamente cinco o seis», para estas cerraduras en general (no habla de cerraduras *domésticas* en particular). → La animación usa 5 columnas; **la narración no menciona ninguna cantidad**, porque ninguna fuente lo respalda para cerraduras domésticas.

## 2. Documentación de un fabricante — PENDIENTE
- https://www.abus.com → 403 (no se pudo leer).
- https://www.schlage.com, https://www.kwikset.com, https://www.mul-t-lock.com → cargaron, pero son páginas comerciales sin descripción técnica del cilindro ni cantidad de pernos.
- **Falta** una ficha técnica pública de un fabricante de cilindros. No cambia ninguna afirmación del guion (todas salen de la fuente 1), pero el arranque la pide: queda como pendiente para revisar a mano.

## 3. Cifras en pantalla
- **3 6 2 7 4**: no son medidas reales. Son los **niveles del dibujo** (largo de cada perno en `data.json`: `largoBase + nivel × largoPorNivel`, en px), sin unidad, y la llave del video está cortada para esos niveles. Se presentan como «la contraseña de tu llave» (la idea de que cada llave codifica una serie de alturas sale de la fuente 1: pernos de largo distinto + dientes que suben cada columna a su altura).
- **90°** del giro del rotor: no se dice ni se escribe; es solo la animación.
- No hay ninguna otra cifra en pantalla ni en la voz.
