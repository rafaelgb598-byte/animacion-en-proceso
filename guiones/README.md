# Guiones

Un lugar para todo lo escrito de cada video: guion, prompts, propuestas, planes, entregas y tomas de voz originales.
Mismas 4 carpetas que `videosFinal/` y `videosPrueba/`.

```
guiones/
  APRENDIZAJES.md            ← leer ANTES de escribir un guion nuevo (qué funcionó, qué no, costos)
  <canal>/<nn-video>/
    guion.md | .txt | .json  el texto final que dice la voz (+ qué se ve en cada tramo)
    prompt-vN.md             el pedido original de cada versión
    propuesta.md / plan.md   diagnóstico y storyboard, si los hubo
    ENTREGA.md               qué se entregó, créditos gastados, QA medido
    vN/voz-original/         tomas crudas de ElevenLabs (no se regeneran: se editan)
```

## Índice

| Canal | Video | Gancho | Voz | Estado | Videos (final · pruebas) |
|---|---|---|---|---|---|
| GiroDato | [01 · Efecto señuelo](GiroDato/01-efecto-senuelo/guion.txt) | «Elegí uno. Rápido. ¿Chico por tres dólares… o grande por siete?» | Isaac · ≈ 904 créditos | ✅ final (v3: subtítulos nuevos, sin mostrador) | `videosFinal/GiroDato/01-efecto-senuelo.mp4` · `videosPrueba/GiroDato/01-efecto-senuelo-{prueba-animacion, v1 (final anterior), v2 (con mostrador, descartada)}.mp4` |
| GiroDato | [02 · Stroop](GiroDato/02-stroop/guion.md) | «Decí en voz alta el color. No leas la palabra.» | Isaac · 957 créditos | ✅ final (v5: subtítulos nuevos, mesa en primer plano) | `videosFinal/GiroDato/02-stroop-deci-el-color.mp4` · `videosPrueba/GiroDato/02-stroop-{v1, v2-voz-acelerada, v3-inicio-rapido, v4 (final anterior)}.mp4` |
| MilAños | [03 · Celular](<MilAños/03-1000-anos/final/guion.json>) | «¿Qué quedaría de tu celular después de mil años?» | Isaac · 426 + 381 créditos | ✅ final (v4, guion en `MilAños/03-1000-anos/v4/`) | `videosFinal/MilAños/03-1000-anos-celular.mp4` · `videosPrueba/MilAños/03-1000-anos-celular-{v2, v3}.mp4` |
| MilAños | [04 · Cocina](MilAños/04-1000-anos-cocina/guion.md) (episodio 2 de «Último en pie») | «Se corta la luz. Nadie vuelve.» + apuesta «¿Cuál queda en pie? 1, 2 o 3» | v2: Isaac (plugin) · 503 créditos | 🧪 prueba v2 (esperando revisión; guion en `MilAños/04-1000-anos-cocina/v2/`) | — · `videosPrueba/MilAños/04-1000-anos-cocina-{v1, v2}.mp4` |
| Ciberseguridad | [01 · Te mandé un código por error](Ciberseguridad/01-codigo-por-error/guion.json) (serie [«Anatomía de una estafa»](Ciberseguridad/README.md), ES + EN) | «¿SE LO PASAS?» + PASAR / NO | Donovan · 688 + 703 créditos (plugin) | ✅ final a la primera (ES 56 s · EN 50 s) | `videosFinal/Ciberseguridad/01-codigo-por-error-{es, en}.mp4` · `videosPrueba/Ciberseguridad/01-codigo-por-error-{es-v1-borrador-sin-voz, es-v2-borrador-sin-voz, es-v3, en-v1}.mp4` |
| Ciberseguridad | [02 · Hola, cambié de número](Ciberseguridad/04-hola-mama/prompt-v1.md) | — | — | 📝 plan viejo (numerado 04 por error): pasa a ser el **episodio 02**; hay que adaptar su prompt a la plantilla del 01 | — |

Al terminar cada video: sumar su fila acá y lo aprendido en `APRENDIZAJES.md`. Cuando el usuario aprueba una versión como final,
se mueve a `videosFinal/<canal>/` y la final anterior queda en `videosPrueba/<canal>/` con su número de versión (nada se borra).
Todo (renders de prueba y finales) se sube a `main`; solo `videosPrueba/<canal>/qa/` queda en la compu (se regenera con los scripts).
