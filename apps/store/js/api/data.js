window.KubitData = {
  categorias: [
    { id: 'cat-todos', nombre: 'Todos Los Productos', slug: 'todos', icono: '📋', tipo: 'view_all', orden: 0 },
    { id: 'cat-imperdibles', nombre: 'Imperdibles', slug: 'imperdibles', icono: '🔥', tipo: 'promo', orden: 1 },
    { id: 'cat-super-oferta', nombre: 'Super Oferta', slug: 'super-oferta', icono: '💥', tipo: 'promo', orden: 2 },
    { id: 'cat-remate', nombre: 'Remate Saldos', slug: 'remate-saldos', icono: '🏷️', tipo: 'promo', orden: 3 },
    { id: 'cat-producto-mes', nombre: 'Producto del Mes', slug: 'producto-mes', icono: '⭐', tipo: 'promo', orden: 4 },
    { id: 'cat-hombres', nombre: 'Hombres', slug: 'hombres', icono: '👔', tipo: 'categoria', orden: 5 },
    { id: 'cat-mujeres', nombre: 'Mujeres', slug: 'mujeres', icono: '👗', tipo: 'categoria', orden: 6 },
    { id: 'cat-ninos', nombre: 'Niños', slug: 'ninos', icono: '🧒', tipo: 'categoria', orden: 7 },
    { id: 'cat-bebes', nombre: 'Bebés', slug: 'bebes', icono: '🍼', tipo: 'categoria', orden: 8 },
    { id: 'cat-mascotas', nombre: 'Mascotas', slug: 'mascotas', icono: '🐾', tipo: 'categoria', orden: 9 },
    { id: 'cat-deportes', nombre: 'Deportes', slug: 'deportes', icono: '⚽', tipo: 'categoria', orden: 10 },
    { id: 'cat-thc', nombre: 'THC y Más', slug: 'thc', icono: '🌿', tipo: 'categoria', orden: 11 },
    { id: 'cat-vehiculos', nombre: 'Vehículos', slug: 'vehiculos', icono: '🚗', tipo: 'categoria', orden: 12 },
    { id: 'cat-gadgets', nombre: 'Gadgets y Tecnología', slug: 'gadgets', icono: '📱', tipo: 'categoria', orden: 13 },
    { id: 'cat-hogar', nombre: 'Hogar', slug: 'hogar', icono: '🏠', tipo: 'categoria', orden: 14 },
    { id: 'cat-cursos', nombre: 'Cursos Virtuales', slug: 'cursos', icono: '🎓', tipo: 'categoria', orden: 15 },
  ],

  productos: [
    {
      id: 'prod-001', nombre: 'Camiseta Premium Algodón', slug: 'camiseta-premium-algodon',
      descripcion_corta: 'Camiseta de algodón peinado 100% premium. Suave al tacto y duradera.',
      descripcion_larga: 'Confeccionada en algodón peinado 24/1 de 180 g/m². Costuras reforzadas, cuello ribeteado y corte regular. Disponible en tallas S a XL. Ideal para uso diario o personalización corporativa.',
      precio: 45000, categoria: 'hombres', tags: ['destacado'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Camiseta',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Frente',
        'https://placehold.co/400x400/slate-800/white?text=Espalda',
        'https://placehold.co/400x400/slate-700/white?text=Detalle',
      ],
      especificaciones: [
        { nombre: 'Material', valor: 'Algodón peinado 100%' },
        { nombre: 'Gramaje', valor: '180 g/m²' },
        { nombre: 'Tallas', valor: 'S, M, L, XL' },
      ],
      variantes: [
        { id: 'var-001a', nombre: 'Talla S', stock: 15 },
        { id: 'var-001b', nombre: 'Talla M', stock: 22 },
        { id: 'var-001c', nombre: 'Talla L', stock: 8 },
      ]
    },
    {
      id: 'prod-002', nombre: 'Reloj Smart Band', slug: 'reloj-smart-band',
      descripcion_corta: 'Pulsera inteligente con monitor cardíaco y oxímetro.',
      descripcion_larga: 'Pantalla AMOLED 1.43", monitoreo continuo de frecuencia cardíaca, SpO2, sueño y estrés. Resistente al agua 5ATM. Batería de hasta 14 días. Compatible iOS y Android.',
      precio: 69900, precio_original: 89900, categoria: 'gadgets', tags: ['destacado', 'oferta'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Smart+Band',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Reloj',
        'https://placehold.co/400x400/slate-800/white?text=Pantalla',
      ],
      especificaciones: [
        { nombre: 'Pantalla', valor: 'AMOLED 1.43"' },
        { nombre: 'Batería', valor: '14 días' },
        { nombre: 'Resistencia', valor: '5ATM' },
      ],
      variantes: [
        { id: 'var-002a', nombre: 'Negro', stock: 30 },
        { id: 'var-002b', nombre: 'Blanco', stock: 18 },
      ]
    },
    {
      id: 'prod-003', nombre: 'Perfume Importado 50ml', slug: 'perfume-importado-50ml',
      descripcion_corta: 'Fragancia floral amaderada con notas de vainilla y sándalo.',
      descripcion_larga: 'Eau de Parfum concentración 20%. Notas de salida: bergamota y pera. Notas de corazón: jazmín y rosa. Notas de fondo: vainilla, almizcle y sándalo. Fijación de 8 a 12 horas.',
      precio: 120000, categoria: 'mujeres', tags: ['destacado'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Perfume',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Frasco',
        'https://placehold.co/400x400/slate-800/white?text=Caja',
      ],
      especificaciones: [
        { nombre: 'Tipo', valor: 'Eau de Parfum' },
        { nombre: 'Contenido', valor: '50 ml' },
        { nombre: 'Familia', valor: 'Floral Amaderada' },
      ],
      variantes: [
        { id: 'var-003a', nombre: '50ml', stock: 12 },
        { id: 'var-003b', nombre: '100ml', stock: 5 },
      ]
    },
    {
      id: 'prod-004', nombre: 'Set Sartenes Antiadherentes', slug: 'set-sartenes-antiadherentes',
      descripcion_corta: 'Juego de 3 sartenes con recubrimiento cerámico ecológico.',
      descripcion_larga: 'Set de 3 sartenes (20cm, 24cm, 28cm) con recubrimiento cerámico libre de PFOA. Base magnética apta para inducción. Mangos ergonómicos de baquelita anti-calor.',
      precio: 75000, precio_original: 95000, categoria: 'hogar', tags: ['oferta', 'liquidacion'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Sartenes',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Set',
        'https://placehold.co/400x400/slate-800/white?text=Detalle',
      ],
      especificaciones: [
        { nombre: 'Piezas', valor: '3' },
        { nombre: 'Material', valor: 'Aluminio + Cerámica' },
        { nombre: 'Apta inducción', valor: 'Sí' },
      ],
      variantes: []
    },
    {
      id: 'prod-005', nombre: 'Pelota Fútbol Profesional', slug: 'pelota-futbol-profesional',
      descripcion_corta: 'Balón de fútbol cosido a máquina con cubierta de PU.',
      descripcion_larga: 'Tamaño oficial #5. Cubierta de poliuretano de alto rendimiento. Cámara de butilo que retiene el aire por más tiempo. Costura a máquina de 32 paneles. Ideal para entrenamiento y partidos.',
      precio: 55000, categoria: 'deportes', tags: [],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Pelota',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Pelota',
      ],
      especificaciones: [
        { nombre: 'Tamaño', valor: '#5 Oficial' },
        { nombre: 'Material', valor: 'PU' },
        { nombre: 'Uso', valor: 'Entrenamiento y partido' },
      ],
      variantes: []
    },
    {
      id: 'prod-006', nombre: 'Cargador Portátil 20000mAh', slug: 'cargador-portatil-20000mah',
      descripcion_corta: 'Batería externa de alta capacidad con carga rápida 18W.',
      descripcion_larga: 'Capacidad 20000mAh. Puerto USB-C entrada/salida 18W Power Delivery. 2 puertos USB-A QC 3.0. Carga hasta 4 dispositivos simultáneamente. LED indicador de batería. Incluye cable USB-C.',
      precio: 42000, precio_original: 55000, categoria: 'gadgets', tags: ['imperdible'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Cargador',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Cargador',
        'https://placehold.co/400x400/slate-800/white?text=Puertos',
      ],
      especificaciones: [
        { nombre: 'Capacidad', valor: '20000 mAh' },
        { nombre: 'Carga rápida', valor: '18W PD + QC 3.0' },
        { nombre: 'Puertos', valor: '1 USB-C + 2 USB-A' },
      ],
      variantes: [
        { id: 'var-006a', nombre: 'Negro', stock: 25 },
        { id: 'var-006b', nombre: 'Blanco', stock: 15 },
      ]
    },
    {
      id: 'prod-007', nombre: 'Suéter de Lana para Niño', slug: 'suerter-lana-nino',
      descripcion_corta: 'Suéter tejido en lana merino súper suave para niños.',
      descripcion_larga: 'Tejido en lana merino 100% hipoalergénica. Cuello redondo, mangas largas con puños elastizados. Disponible en múltiples colores. Ideal para clima frío. Tallas 2 a 12 años.',
      precio: 38000, categoria: 'ninos', tags: [],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Suéter',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Suéter',
      ],
      especificaciones: [
        { nombre: 'Material', valor: 'Lana merino 100%' },
        { nombre: 'Tallas', valor: '2 a 12 años' },
        { nombre: 'Lavado', valor: 'Seco recomendado' },
      ],
      variantes: [
        { id: 'var-007a', nombre: 'Talla 4', stock: 10 },
        { id: 'var-007b', nombre: 'Talla 6', stock: 15 },
        { id: 'var-007c', nombre: 'Talla 8', stock: 8 },
      ]
    },
    {
      id: 'prod-008', nombre: 'Shampoo para Perros 500ml', slug: 'shampoo-perros-500ml',
      descripcion_corta: 'Shampoo neutro pH balanceado para perros de todas las razas.',
      descripcion_larga: 'Fórmula suave con avena coloidal y aloe vera. pH balanceado específico para caninos. Sin parabenos ni sulfatos. Ayuda a aliviar picazón e irritación. Aroma fresco duradero.',
      precio: 22000, categoria: 'mascotas', tags: [],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Shampoo',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Botella',
      ],
      especificaciones: [
        { nombre: 'Contenido', valor: '500 ml' },
        { nombre: 'pH', valor: 'Balanceado canino' },
        { nombre: 'Libre de', valor: 'Parabenos y sulfatos' },
      ],
      variantes: [
        { id: 'var-008a', nombre: '500ml', stock: 0 },
      ]
    },
    {
      id: 'prod-009', nombre: 'Curso: Python desde Cero', slug: 'curso-python-desde-cero',
      descripcion_corta: 'Aprende Python desde cero hasta nivel intermedio en 8 semanas.',
      descripcion_larga: 'Más de 40 horas de video bajo demanda. Proyectos prácticos: calculadora, gestor de tareas, web scraper, API REST. Incluye certificado digital. Acceso de por vida al contenido actualizado.',
      precio: 25000, categoria: 'cursos', tags: ['destacado', 'producto-mes'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Python',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Curso',
        'https://placehold.co/400x400/slate-800/white?text=Contenido',
      ],
      especificaciones: [
        { nombre: 'Duración', valor: '40+ horas' },
        { nombre: 'Proyectos', valor: '4 prácticos' },
        { nombre: 'Acceso', valor: 'De por vida' },
        { nombre: 'Certificado', valor: 'Sí' },
      ],
      variantes: []
    },
    {
      id: 'prod-010', nombre: 'Organizador Escritorio', slug: 'organizador-escritorio',
      descripcion_corta: 'Organizador de escritorio multifuncional en bambú natural.',
      descripcion_larga: 'Fabricado en bambú sostenible con acabado natural. 6 compartimentos: portalápices, bandeja para clips, soporte para celular, bandeja para notas adhesivas. Base antideslizante de silicona.',
      precio: 28000, categoria: 'hogar', tags: [],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Organizador',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Organizador',
        'https://placehold.co/400x400/slate-800/white?text=Compartimentos',
      ],
      especificaciones: [
        { nombre: 'Material', valor: 'Bambú natural' },
        { nombre: 'Compartimentos', valor: '6' },
        { nombre: 'Base', valor: 'Antideslizante' },
      ],
      variantes: []
    },
    {
      id: 'prod-011', nombre: 'Zapatillas Running Mujer', slug: 'zapatillas-running-mujer',
      descripcion_corta: 'Zapatillas de running con amortiguación reactiva y diseño ligero.',
      descripcion_larga: 'Suela de caucho resistente con patrón de tracción multidireccional. Mediasuela con tecnología React que devuelve energía en cada pisada. Upper de malla transpirable. Peso 220g talla 38.',
      precio: 135000, categoria: 'mujeres', tags: ['destacado', 'mas-vendido'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Zapatillas',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Lateral',
        'https://placehold.co/400x400/slate-800/white?text=Superior',
        'https://placehold.co/400x400/slate-700/white?text=Suela',
      ],
      especificaciones: [
        { nombre: 'Peso', valor: '220g (talla 38)' },
        { nombre: 'Tipo', valor: 'Running' },
        { nombre: 'Tallas', valor: '36 a 42' },
      ],
      variantes: [
        { id: 'var-011a', nombre: 'Talla 36', stock: 5 },
        { id: 'var-011b', nombre: 'Talla 37', stock: 8 },
        { id: 'var-011c', nombre: 'Talla 38', stock: 12 },
        { id: 'var-011d', nombre: 'Talla 39', stock: 7 },
      ]
    },
    {
      id: 'prod-012', nombre: 'Gorra Deportiva Ajustable', slug: 'gorra-deportiva-ajustable',
      descripcion_corta: 'Gorra tipo béisbol con ajuste trasero y material transpirable.',
      descripcion_larga: 'Confeccionada en algodón y poliéster con malla transpirable en la parte posterior. Visera precurveada. Cierre ajustable con correa de velcro. Bordado frontal de alta calidad.',
      precio: 18000, categoria: 'hombres', tags: ['imperdible'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Gorra',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Frente',
        'https://placehold.co/400x400/slate-800/white?text=Costado',
      ],
      especificaciones: [
        { nombre: 'Material', valor: 'Algodón + Poliéster' },
        { nombre: 'Ajuste', valor: 'Velcro trasero' },
        { nombre: 'Unisex', valor: 'Sí' },
      ],
      variantes: [
        { id: 'var-012a', nombre: 'Negra', stock: 20 },
        { id: 'var-012b', nombre: 'Azul', stock: 15 },
        { id: 'var-012c', nombre: 'Roja', stock: 12 },
      ]
    },
    {
      id: 'prod-013', nombre: 'Lámpara LED USB Recargable', slug: 'lampara-led-usb',
      descripcion_corta: 'Lámpara LED recargable con 3 niveles de brillo y base magnética.',
      descripcion_larga: 'LED de 5W equivalente a 40W incandescente. 3 niveles de brillo: 100%, 50%, 25%. Base con imán y clip integrado. Batería recargable 1200mAh vía USB-C. Autonomía de 4 a 12 horas.',
      precio: 15000, precio_original: 25000, categoria: 'hogar', tags: ['super-oferta', 'liquidacion'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Lámpara',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=LED',
      ],
      especificaciones: [
        { nombre: 'Potencia', valor: '5W LED' },
        { nombre: 'Batería', valor: '1200 mAh' },
        { nombre: 'Autonomía', valor: '4 a 12 horas' },
      ],
      variantes: [
        { id: 'var-013a', nombre: 'Blanca', stock: 30 },
        { id: 'var-013b', nombre: 'Negra', stock: 22 },
      ]
    },
    {
      id: 'prod-014', nombre: 'Accesorio Bluetooth para Coche', slug: 'accesorio-bluetooth-coche',
      descripcion_corta: 'Kit manos libres Bluetooth con FM transmisor y cargador USB.',
      descripcion_larga: 'Transmisor FM Bluetooth 5.0 para coche. Manos libres con micrófono incorporado. 2 puertos USB para carga rápida. Pantalla LED. Soporta llamadas y música. Frecuencia FM ajustable.',
      precio: 35000, categoria: 'vehiculos', tags: [],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Bluetooth+Auto',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Dispositivo',
        'https://placehold.co/400x400/slate-800/white?text=Instalado',
      ],
      especificaciones: [
        { nombre: 'Bluetooth', valor: '5.0' },
        { nombre: 'Puertos USB', valor: '2 (carga rápida)' },
        { nombre: 'Función', valor: 'Manos libres + música' },
      ],
      variantes: []
    },
    {
      id: 'prod-015', nombre: 'Monitor 24" Full HD', slug: 'monitor-24-full-hd',
      descripcion_corta: 'Monitor IPS Full HD 75Hz con bordes delgados y filtro de luz azul.',
      descripcion_larga: 'Pantalla IPS 23.8" resolución 1920x1080. Tasa de refresco 75Hz. Tiempo de respuesta 4ms. Relación de contraste 1000:1. Filtro de luz azul integrado. Puertos HDMI y VGA. Incluye base ajustable en inclinación.',
      precio: 320000, categoria: 'gadgets', tags: ['destacado'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Monitor',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Monitor',
        'https://placehold.co/400x400/slate-800/white?text=Puertos',
      ],
      especificaciones: [
        { nombre: 'Tamaño', valor: '23.8"' },
        { nombre: 'Resolución', valor: 'Full HD (1920x1080)' },
        { nombre: 'Panel', valor: 'IPS' },
        { nombre: 'Refresco', valor: '75Hz' },
      ],
      variantes: []
    },
    {
      id: 'prod-016', nombre: 'Crema Hidratante Facial', slug: 'crema-hidratante-facial',
      descripcion_corta: 'Crema hidratante con ácido hialurónico y vitamina C.',
      descripcion_larga: 'Fórmula ligera de rápida absorción. Ácido hialurónico de triple peso molecular para hidratación profunda. Vitamina C estabilizada para luminosidad. Ideal para uso diario, mañana y noche.',
      precio: 32000, categoria: 'mujeres', tags: [],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Crema',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Frasco',
      ],
      especificaciones: [
        { nombre: 'Contenido', valor: '50 ml' },
        { nombre: 'Ingredientes clave', valor: 'Ácido hialurónico, Vitamina C' },
        { nombre: 'Uso', valor: 'Diario' },
      ],
      variantes: []
    },
    {
      id: 'prod-017', nombre: 'Mordedor para Bebé', slug: 'mordedor-bebe',
      descripcion_corta: 'Mordedor texturizado de silicona 100% libre de BPA para bebés.',
      descripcion_larga: 'Diseñado ergonómicamente para manos pequeñas. Silicona de grado alimenticio 100% libre de BPA, ftalatos y látex. Texturas variadas para aliviar la encía. Fácil de agarrar y lavar. Colores vibrantes no tóxicos.',
      precio: 12000, categoria: 'bebes', tags: ['imperdible'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Mordedor',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Mordedor',
      ],
      especificaciones: [
        { nombre: 'Material', valor: 'Silicona grado alimenticio' },
        { nombre: 'Libre de', valor: 'BPA, ftalatos, látex' },
        { nombre: 'Edad', valor: '3 meses+' },
      ],
      variantes: [
        { id: 'var-017a', nombre: 'Verde', stock: 25 },
        { id: 'var-017b', nombre: 'Naranja', stock: 25 },
        { id: 'var-017c', nombre: 'Azul', stock: 25 },
      ]
    },
    {
      id: 'prod-018', nombre: 'Curso: Marketing Digital', slug: 'curso-marketing-digital',
      descripcion_corta: 'Domina SEO, Google Ads, redes sociales y email marketing.',
      descripcion_larga: '60 horas de contenido actualizado. Módulos: SEO on-page y off-page, Google Ads y Shopping, Meta Ads (Facebook/Instagram), Email Marketing con Mailchimp, Analytics y Reporting. Incluye plantillas descargables y certificado.',
      precio: 30000, categoria: 'cursos', tags: ['destacado'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Marketing',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Curso',
        'https://placehold.co/400x400/slate-800/white?text=Módulos',
      ],
      especificaciones: [
        { nombre: 'Duración', valor: '60 horas' },
        { nombre: 'Módulos', valor: '5' },
        { nombre: 'Certificado', valor: 'Sí' },
      ],
      variantes: []
    },
    {
      id: 'prod-019', nombre: 'Collar Antiparasitario Perros', slug: 'collar-antiparasitario-perros',
      descripcion_corta: 'Collar repelente de pulgas y garrapatas con protección de 8 meses.',
      descripcion_larga: 'Tecnología de liberación controlada. Protege contra pulgas, garrapatas, piojos y mosquitos. Resistente al agua. Ajustable hasta 65cm. Eficacia comprobada por 8 meses. Para perros desde 2 meses de edad.',
      precio: 45000, categoria: 'mascotas', tags: [],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Collar',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Collar',
      ],
      especificaciones: [
        { nombre: 'Duración', valor: '8 meses' },
        { nombre: 'Protege contra', valor: 'Pulgas, garrapatas, piojos, mosquitos' },
        { nombre: 'Ajustable', valor: 'Hasta 65cm' },
      ],
      variantes: [
        { id: 'var-019a', nombre: 'Perros pequeños', stock: 18 },
        { id: 'var-019b', nombre: 'Perros medianos', stock: 15 },
        { id: 'var-019c', nombre: 'Perros grandes', stock: 10 },
      ]
    },
    {
      id: 'prod-020', nombre: 'Soporte Celular para Carro', slug: 'soporte-celular-carro',
      descripcion_corta: 'Soporte magnético para celular con adhesivo fuerte y rotación 360°.',
      descripcion_larga: 'Base con adhesivo nano-micro que se adhiere a cualquier superficie lisa. Brazo articulado con rótula para rotación 360°. Imán de neodimio N52 que sujeta firmemente incluso en baches. Incluye 2 placas metálicas.',
      precio: 18000, precio_original: 28000, categoria: 'vehiculos', tags: ['super-oferta'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Soporte+Carro',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Soporte',
        'https://placehold.co/400x400/slate-800/white?text=Instalado',
      ],
      especificaciones: [
        { nombre: 'Tipo', valor: 'Magnético' },
        { nombre: 'Rotación', valor: '360°' },
        { nombre: 'Incluye', valor: '2 placas metálicas' },
      ],
      variantes: []
    },
    {
      id: 'prod-021', nombre: 'Short Deportivo Hombre', slug: 'short-deportivo-hombre',
      descripcion_corta: 'Short de entrenamiento en tela dry-fit con bolsillos laterales.',
      descripcion_larga: 'Tela dry-fit 100% poliéster que absorbe el sudor y se seca rápidamente. Cintura elástica con cordón ajustable. Dos bolsillos laterales con cierre. Costuras planas antirozaduras. Ideal para gimnasio y running.',
      precio: 25000, categoria: 'hombres', tags: [],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Short',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Frente',
        'https://placehold.co/400x400/slate-800/white?text=Espalda',
      ],
      especificaciones: [
        { nombre: 'Material', valor: 'Poliéster dry-fit' },
        { nombre: 'Tallas', valor: 'S, M, L, XL' },
        { nombre: 'Bolsillos', valor: '2 laterales con cierre' },
      ],
      variantes: [
        { id: 'var-021a', nombre: 'Talla S', stock: 14 },
        { id: 'var-021b', nombre: 'Talla M', stock: 20 },
        { id: 'var-021c', nombre: 'Talla L', stock: 16 },
      ]
    },
    {
      id: 'prod-022', nombre: 'Cojín de Lactancia', slug: 'cojin-lactancia',
      descripcion_corta: 'Cojín ergonómico para lactancia con funda lavable hipoalergénica.',
      descripcion_larga: 'Forma de media luna diseñada ergonómicamente. Relleno de fibra siliconada hipoalergénica. Funda extraíble y lavable en algodón orgánico. Alivia la tensión en brazos y espalda durante la lactancia.',
      precio: 48000, categoria: 'bebes', tags: [],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Cojín',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Cojín',
      ],
      especificaciones: [
        { nombre: 'Relleno', valor: 'Fibra siliconada' },
        { nombre: 'Funda', valor: 'Algodón orgánico, extraíble' },
        { nombre: 'Lavable', valor: 'Sí' },
      ],
      variantes: []
    },
    {
      id: 'prod-023', nombre: 'Morral Gimnasio 30L', slug: 'morral-gimnasio-30l',
      descripcion_corta: 'Morral deportivo impermeable con compartimento para calzado.',
      descripcion_larga: 'Capacidad 30 litros. Compartimento principal con separador para ropa sucia. Bolsillo aislado térmico para lonchera. Compartimento frontal con organizador. Bolsillo lateral para botella de agua. Espalda acolchada.',
      precio: 62000, categoria: 'deportes', tags: [],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Morral',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Frente',
        'https://placehold.co/400x400/slate-800/white?text=Interior',
      ],
      especificaciones: [
        { nombre: 'Capacidad', valor: '30 litros' },
        { nombre: 'Material', valor: 'Poliéster impermeable' },
        { nombre: 'Compartimentos', valor: '5' },
      ],
      variantes: [
        { id: 'var-023a', nombre: 'Negro', stock: 12 },
        { id: 'var-023b', nombre: 'Gris', stock: 8 },
      ]
    },
    {
      id: 'prod-024', nombre: 'Audífonos Bluetooth', slug: 'audifonos-bluetooth',
      descripcion_corta: 'Audífonos inalámbricos over-ear con cancelación de ruido activa.',
      descripcion_larga: 'Driver de 40mm con respuesta de frecuencia 20Hz-20kHz. Cancelación de ruido activa ANC. Bluetooth 5.2 con códec AAC y aptX. Batería 30 horas con ANC, 40 horas sin ANC. Plegables con estuche incluido.',
      precio: 55000, categoria: 'gadgets', tags: ['destacado', 'producto-mes', 'mas-vendido'],
      imagen: 'https://placehold.co/400x400/slate-950/white?text=Audífonos',
      imagenes: [
        'https://placehold.co/400x400/slate-950/white?text=Lateral',
        'https://placehold.co/400x400/slate-800/white?text=Plegados',
        'https://placehold.co/400x400/slate-700/white?text=Estuche',
      ],
      especificaciones: [
        { nombre: 'Driver', valor: '40mm' },
        { nombre: 'Bluetooth', valor: '5.2' },
        { nombre: 'Batería', valor: '30h (ANC) / 40h (sin ANC)' },
        { nombre: 'Cancelación ruido', valor: 'ANC activa' },
      ],
      variantes: [
        { id: 'var-024a', nombre: 'Negro', stock: 20 },
        { id: 'var-024b', nombre: 'Blanco', stock: 15 },
      ]
    },
  ]
};
