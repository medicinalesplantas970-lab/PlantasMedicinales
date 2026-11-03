/*
 * Este archivo reúne todas las funciones para guardar información en el navegador.
 * localStorage funciona como una pequeña base de datos: no necesita internet ni servidor.
 */
(function () {
  // Esta es la etiqueta con la que guardamos todos los datos de NaturalApp.
  const KEY = "naturalAppData";
  const PLANT_TEXT_RESTORED_KEY = "naturalAppPlantTextRestoredV1";

  // Datos iniciales. Solo se usan la primera vez que se abre la aplicación.
  const initialData = {
    users: [
      {
        id: "admin",
        name: "Administrador",
        email: "admin@naturalapp.local",
        password: "admin",
        role: "admin",
        favorites: [],
      },
    ],
    plants: [
      {
        id: "Manzanilla",
        name: "Manzanilla",
        image: "https://herbario.istmas.edu.ec/wp-content/uploads/2022/05/MANZANILLA.jpg",
        description: "Es una planta aromatica muy conocida por usos mendicinales y terapeuticos.",
        uses: "tiene propiedades antiflamatorio y antioxidante,tiene efecto ansiolitico y antidepresivo.Es utilizado en el tratamiento de bronquitis,resfrio,tos,neumonia,contusiones,esquinces asi tambien en infecciones urinarias,afecciones de la piel y alergia.Tambien ayuda a mejorar la digestion disminuye los colicos,alivia los gases y calama los malestares estomacales.",
        preparation: "Colocar flores trituradas o cortar en una taza de agua hervida caliente,despues de unos minutos colar y tomar tres veces al dia antes de los alimentos.",
        likes: 0,
        comments: [],
      },
      {
        id: "Menta",
        name: "Menta",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXPdqiwAtUcANnLWkPwQWVyV4krPmu6r2iLF8oHCBQEMmxims9P4NdXAkr&s=10",
        description: "Es una planta aromática y medicinal de hojas verdes, pequeñas y de forma alargada. Tiene un olor fresco y agradable y un sabor refrescante.",
        uses: "Es una planta con propiedades analgésicas, ayuda en la eliminación de secreciones, descongestionando las vías respiratorias.",
        preparation: "Infusión: Colocar una a dos hojas de menta (cortadas o trituradas) en una taza de agua hervida, luego dejar reposar de 3 a 5 min, colar o tamizar y tomar 3 veces al día antes de las comidas.",
        likes: 0,
        comments: [],
      },
      {
        id: "Toronjil",
        name: "Toronjil",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQurEwvGosaAB7vpCC_kQJ8IVHtnIiiWCyLhtRcuKldARwVfIeCaxgxJSVl&s=10",
        description: "Es una planta medicinal de hojas verdes, suaves y ligeramente dentadas. Tiene un aroma agradable parecido al limón y pequeñas flores blancas o rosadas.",
        uses: "Tiene una tradición como remedio tónico que levanta el ánimo y el corazón. Las hojas y los brotes jóvenes son antibacterianos, antiespasmódicos, antivirales, carminativos, diaforéticos, digestivos, emenagogos, febrífugos, sedantes y tónicos. Se utiliza para el tratamiento de fiebres y resfriados, indigestiones asociadas con tensión nerviosa, depresión, insomnio leve, dolores de cabeza. Se le atribuyen también propiedades antiespasmódicas y analgésicas.",
        preparation: "En una taza con agua caliente, añadir 3 hojas de toronjil cortadas o trituradas, dejar reposar durante 5 minutos, colar y beber 2 veces al día, durante 3 días.",
        likes: 0,
        comments: [],
      },
      {
        id: "Romero",
        name: "Romero",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbx057cQsPcgLHURlt02igZXRCM5mZL5rHrZbAHyDdBKEfwXVpXb185gmW&s=10",
        description: "Es un arbusto de hojas estrechas, alargadas y de color verde oscuro, con un aroma intenso y característico. Sus flores suelen ser pequeñas y de tonos azulados, violetas, rosados o blancos.",
        uses: "Fortalece el sistema nervioso, también se emplea para el tratamiento de enfermedades del sistema respiratorio como los resfríos, la tos y bronquitis. Es antioxidante,antiinflamatorio y estimulante de la circulacion. ",
        preparation: "Colocar una ramita (3 cm) en una taza de agua hervida, dejar reposar de 3 a 5 minutos, colar o tamizar y consumir dos tazas por día durante tres a cinco días.",
        likes: 0,
        comments: [],
      },
      {
        id: "Sábila",
        name: "Sábila",
        image: "https://images.milenio.com/R0TpfBlehcciLP7cg_iQqijwzto=/345x194/uploads/media/2026/06/30/cuidados-basicos-de-la-sabila.jpg",
        description: "es una plantaque se caracteriza por sus hojas gruesas, carnosas, alargadas y de color verde, con pequeños bordes espinosos. En el interior de sus hojas contiene un gel transparente y viscoso que se utiliza en productos cosméticos y en algunas preparaciones tradicionales.",
        uses: "El gel transparente acelera la cicatrización de quemaduras leves (de primer y segundo grado) y pequeñas lesiones,Ayuda a calmar la piel irritada, disminuye el acné,manchas solares y contribuye a proteger la flora intestinal y se utiliza de forma complementaria para manejar molestias de la gastritis.",
        preparation: "Lavar la sàbila y cortar en la mitad sacar su gel y aplicar en la piel no aplicar nada del liquido amarrillo.",
        likes: 0,
        comments: [],
      },
      {
        id: "Oregano",
        name: "Orégano",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT13dVY_BHFBUyoa6rCUDLloqTUywBTdAR8LALZ8AEplKvmD650NwHuczc&s=10",
        description: "tallos ramificados, hojas pequeñas, ovaladas y aromáticas, y flores pequeñas de color blanco, rosado.",
        uses: "se emplea para aliviar la sensación de pesadez, los gases y la hinchazón abdominal,asi mismo en resfriados y tos",
        preparation: "Calentar el agua hasta que hierva.Retirar del fuego y añadir el orégano.Tapar y dejar reposar entre 5 y 10 minutos.Colar y dejar enfriar hasta una temperatura adecuada para beber.",
        likes: 0,
        comments: [],
      },
      {
        id: "Albahaca",
        name: "Albahaca",
        image: "https://static.bainet.es/clip/7d9bff8e-d899-4b0e-88d5-1fc6ff75b363_source-aspect-ratio_1600w_0.jpg",
        description: "Es una planta aromática de color verde y agradable olor. Tiene hojas suaves, ovaladas y de sabor característico.",
        uses: "Se usa para el tratamiento de enfermedades febriles, especialmente resfriados e influenza, apropiado para problemas del aparato respiratorio y el asma. También actúa sobre el sistema digestivo y nervioso, aliviando flatulencias, calambres estomacales, cólicos e indigestiones,tambien se usa para disminuir el estres y la ansiedad.",
        preparation:"En un recipiente añadir un litro de agua hervida caliente, agregar 20 hojas de albahaca, dejar reposar (con tapa) hasta entibiar, tomar un vaso dos a tres veces al día durante siete días. Para reforzar el tratamiento se puede endulzar con miel y agregar el jugo de medio limón",
        likes: 0,
        comments: [],
      },
      {
        id: "Eucalipto",
        name: "Eucalipto",
        image: "https://greendepotgt.com/cdn/shop/products/eucalyptus-oil-jpg_81c7fca1-a637-478c-9c23-8cb2b9759352.jpg?v=1681493739",
        description: "Es un árbol de crecimiento rápido. Puede alcanzar una gran altura y se caracteriza por tener un tronco recto y hojas alargadas de color verde grisáceo, con un aroma fuerte y característico.",
        uses: "Es expectorante, antiséptico, descongestionante, para prevenir y aliviar la gripe, resfrío, asma, bronquitis, mediante vahos, baños de vapor que mejoran la congestión, faringitis, amigdalitis y gingivitis. Además, tiene propiedad antiinflamatoria, antibacteriana, antifúngica (hongos), antioxidante y mejora las defensas del cuerpo humano.",
        preparation: "Colocar 2 hojas de eucalipto en una taza de agua hervida, dejar reposar y colar. Se recomienda consumir 2 a 3 tazas por día por un periodo de 5 días.Hacer hervir en un litro de agua 10 hojas (desinfectante de ambientes).",
        likes: 0,
        comments: [],
      },
      {
        id: " Cedrón Paja",
        name: " Cedrón Paja",
        image: "https://calendariosaboresbolivia.com/wp-content/uploads/2013/01/images-18.jpg",
        description: "Sus hojas  son alargadas y delgadas, generalmente de color verde, y forma matas o grupos de tallos finos. Es una planta resistente que puede crecer en terrenos poco húmedos.",
        uses: "Es utilizada para el tratamiento de problemas respiratorios, ayuda a expulsar secreciones (expectorante), alivia el dolor, la fiebre y la ansiedad. También favorece la digestión, puede eliminar hongos y bacterias,Tambien ayuda a calmar el sistema nervioso,reduciendo el estres y la ansiedad y facilitando el sueño.",
        preparation: "Hacer hervir cuatro hojas de paja cedrón fresco en un litro de agua, dejar reposar hasta que enfríe, colar y tomar dos veces al día durante cinco días.Vaporización: En un recipiente, poner a hervir dos litros de agua, agregar diez hojas de paja cedrón, dejar hervir un minuto, retirar del fuego la preparación, acercar el rostro al recipiente e inhalar el vapor cubriendo la cabeza con una toalla..",
        likes: 0,
        comments: [],
      },
      {
        id: "Perejil",
        name: "Perefil",
        image: "https://img.editor80.com/DJm_KqKSWR-Fc39t54l6od6irJhztvKaLTkra_4SOa4/rs:fit:1280:0:0/q:65/aHR0cHM6Ly9tZWRpYS5lZGl0b3I4MC5jb20vdGVuYW50cy9nYXN0cm9sYWIvZm90b2dyYWZpYXMvMjAyMy82LzI3LzQ4NzY3LmpwZw",
        description: "El perejil es una planta herbácea aromática de color verde intenso, conocida por sus hojas pequeñas, divididas y muy fragantes.",
        uses: "Ayuda a estimular la función renal y a eliminar el exceso de líquidos, lo que previene la retención de líquidos y apoya el cuidado de las vías urinarias.Estimula los jugos gástricos, alivia los gases y combate las digestiones pesadas o lentas.",
        preparation: "Se prepara con hojas frescas o secas en agua caliente para ayudar con la retención de líquidos y la digestión.",
        likes: 0,
        comments: [],
      },
      {
        id: "Cola de caballo",
        name: "Cola de caballo",
        image: "https://ysana.com/wp-content/uploads/2022/05/cola-de-caballo.png",
        description: "Se caracteriza por sus tallos delgados, verdes, articulados y con pequeñas ramificaciones que parecen las cerdas de una cola.",
        uses: "Sirve como apoyo tradicional para aliviar molestias leves en las vías urinarias y para el riñon.",
        preparation: "Se hierve una cucharada de los tallos secos en una taza de agua durante 5 a 10 minutos.Dosis recomendada: Se aconseja tomar un máximo de 1 a 2 tazas al día. No se debe usar por más de 3 a 6 semanas seguidas para evitar la pérdida de minerales.",
        likes: 0,
        comments: [],
      },
      {
        id: "Amor seco",
        name: "Amor seco",
        image: "https://kiduaportal.wordpress.com/wp-content/uploads/2016/12/amor_seco.jpg",
        description: "Es una planta herbácea de tamaño pequeño, que crece de manera silvestre en campos, caminos y lugares con bastante vegetación.",
        uses: "Planta con propiedades antiinflamatorias, ampliamente utilizada para tratar enfermedades que presenten fiebre, gripe, dolor de cabeza, diarrea, inflamación de hígado y vesícula.",
        preparation: "Hervir durante 5 minutos una rama (10 centímetros) de la planta en un litro de agua. Colar y tomar 2 tazas cada día, durante 5 días o por requerimiento necesario..",
        likes: 0,
        comments: [],
      },
      {
        id: "Diente de león",
        name: "Diente de león",
        image: "https://www.cronista.com/resizer/v2/Y34AL67HDVHKRLX2R4A3IWMKLE.jpg?auth=518e57e953b1deae59e9439dbdd78a7bd7f092a07beea4d4c6b9f93a05446828&height=533&width=800&quality=70&smart=true",
        description: "El diente de león es una planta herbácea silvestre que se caracteriza por sus flores de color amarillo brillante, sus hojas verdes alargadas con bordes dentados y su raíz larga y resistente.",
        uses: "Estimula la producción de bilis (efecto colerético) y su liberación desde la vesícula, lo que facilita la digestión de las grasas y ayuda a depurar el hígado.Sus hojas favorecen la eliminación de líquidos retenidos en el organismo.Alivia la pesadez estomacal, la dispepsia y estimula el apetito.",
        preparation: "Hierve el agua en una olla o tetera,en cuanto empiece a hervir, apaga el fuego y añade las hojas de diente de león.Tapa el recipiente (esto evita que se evaporen los aceites esenciales) y déjalo reposar entre 5 y 10 minutos y cuela el líquido y bébelo tibio.",
        likes: 0,
        comments: [],
      },
      {
        id: "Molle",
        name: "Molle",
        image: "https://www.miraflores.gob.pe/wp-content/uploads/2022/05/DSC0522-1024x684.jpg",
        description: "El molle es un árbol de hojas perennes, conocido por su aroma característico, sus ramas colgantes y sus pequeños frutos redondos de color rosado o rojizo.",
        uses: "Se utiliza para aliviar dolores musculares y articulares, reducir la inflamación y ayudar con molestias digestivas.El agua de sus hojas o su resina natural funcionan como antisépticos para limpiar heridas, desinflamar golpes o tratar infecciones cutáneas.",
        preparation: "Se lavan las hojas de molle y se colocan en una olla con agua. Se deja hervir durante unos minutos y luego se retira del fuego. Cuando esté tibio, se puede utilizar externamente en baños o compresas tradicionales para aliviar molestias musculares.",
        likes: 0,
        comments: [],
      },
      {
        id: "Apio",
        name: "Apio",
        image: "https://vergelhadas.com/wp-content/uploads/2022/07/apio.jpg",
        description: "El apio es una hortaliza de color verde, caracterizada por sus tallos largos, gruesos, crujientes y jugosos, acompañados de hojas verdes y aromáticas. Tiene un sabor fresco, ligeramente intenso y un aroma característico.",
        uses: "Ayuda a eliminar el exceso de líquidos, toxinas y ácido úrico del organismo,previene el estreñimiento, estimula los jugos gástricos y favorece la sensación de saciedad.y puede ayudar a regular los niveles de glucosa en la sangre.",
        preparation: "Para limpiar profundamente el organismo, haga una cura de jugo de apio, quítele las hojas, corte en pedazos y póngalo en la batidora. Por la mañana y por la tarde beba un gran vaso del jugo. El jugo fortifica el hígado y los riñones, elimina las toxinas y le proporciona una tez magnífica..",
        likes: 0,
        comments: [],
      },
      {
        id: "Paico",
        name: "Paico",
        image: "https://www.viveropilmaiquen.cl/wp-content/uploads/2025/07/paico-2.webp",
        description: "Es una planta medicinal y aromática de olor fuerte y característico. Tiene hojas verdes, alargadas y con bordes irregulares, y puede crecer en diferentes tipos de suelo.",
        uses: "La planta es remedio para resfríos y bronquitis, asimismo es digestivo, alivia cólicos y dolores de estómago y es eficaz contra la mayoría de los parásitos intestinales. También ayuda a eliminar hongos y bacterias.",
        preparation: "Se lavan bien las hojas frescas de care o paico, luego se tritura o muele en un recipiente, se exprime la parte líquida, luego mezclar una cucharilla del extracto en un vaso de agua y tomar esta preparación dos veces al día por tres días.vaporización: En un recipiente, poner a hervir dos litros de agua, agregar una rama de care o paico, dejar hervir un minuto, retirar del fuego la preparación, acercar el rostro al recipiente e inhalar el vapor cubriendo la cabeza con una toalla.Para aliviar la fiebre: Se debe estrujar las hojas de care o paico mezclando con un poco de aceite de cusi, luego esta preparación se debe colocar en la cabeza, las axilas, el pecho y el estómago. También se puede friccionar todo el cuerpo con la preparación..",
        likes: 0,
        comments: [],
      },
      {
        id: "Hoja de palta",
        name: "Hoja de palta",
        image: "https://cdn0.ecologiaverde.com/es/posts/1/4/1/aguacate_con_las_hojas_marrones_por_que_y_como_tratarlo_4141_1200.jpg",
        description: "Se caracteriza por tener una forma alargada y ovalada, color verde y una textura lisa, con una nervadura central bien marcada.",
        uses: "* Alivia la indigestión, los cólicos y los gases. Ayuda a calmar dolores musculares y articulares.Funciona como un apoyo natural para reducir el estrés y combatir el insomnio.",
        preparation: "Se hierven de 3 a 5 hojas en medio litro o un litro de agua durante unos 5 a 10 minutos. Se deja reposar antes de tomar. Se toma una vez al día.",
        likes: 0,
        comments: [],
      },
      {
        id: "Ajenjo",
        name: "Ajenjo",
        image: "https://m.planfor.es/Donnees_Site/Produit/Images/9745/ajenjo_ES_500_0028914.jpg",
        description: "Se caracteriza por sus hojas de color verde grisáceo o plateado, cubiertas de pequeños pelitos que les dan una apariencia suave. Tiene un aroma intenso y un sabor muy amargo.",
        uses: "Ayuda con la mala digestión, la acidez, los gases, la gastritis y los espasmos estomacales al aumentar la producción de ácidos y jugos gástricos, favorece la secreción de bilis , contribuye al buen funcionamiento del hígado y  ayuda a expulsa lombrices y parásitos intestinales.",
        preparation: "e utiliza de 1 a 2 gramos de hojas y tallos secos en una taza de agua caliente dejar reposar tomar una o dos veces al día.",
        likes: 0,
        comments: [],
      },
      {
    id: "Llantén",
    name: "Llantén",
    image: "https://www.clarin.com/2025/07/13/wzusLUaRg_1200x0__1.jpg",
    description: "Es una planta medicinal de hojas verdes, anchas y ovaladas que crece principalmente en lugares húmedos y terrenos con abundante vegetación. Sus hojas presentan nervaduras muy marcadas y crecen desde la base de la planta.",
    uses: "Es una planta que favorece la expulsión de secreciones bronquiales, ideal para afecciones del aparato respiratorio (bronquitis aguda, tos, sinusitis, gripe, asma). También se le atribuyen propiedades antibacterianas, antiinflamatorias, antisépticas, astringente y diurética,sirve para aliviar quemaduras, heridas leves y picaduras de insectos aplicando sus hojas frescas machacadas en forma de cataplasma por accion astrigente y desiflamante.",
    preparation: "En un recipiente con un litro de agua recién hervida, añadir 2 hojas de llantén bien lavadas, dejar reposar y tomar sorbo a sorbo durante el día, por 7 días. Se puede endulzar con miel de abeja.Para fortalecer las defensas: Licuar una hoja de llantén bien lavada con frutas de su preferencia y tomar una sola vez al día en ayunas.Para bajar la fiebre: Lavar bien las hojas de llantén y combinadas con aceite de cusi, aplicar en forma de cataplasma sobre la cabeza, el pecho, las axilas, los pies. Se deja actuar por 2 minutos, se retira y continúa con la fricción con aceite de cusi..",
    likes: 0,
    comments: [],
  },
  {
    id: "Rosa pascua",
    name: "Rosa pascua",
    image: "https://www.tarija200.com/storage/posts/April2019/Ea10mmD8ejB3DfiMxczA.jpg",
    description: "Flores de colores intensos amarillos y naranjas, con un aroma fuerte y particular por las tardes.",
    uses: "Para ayudar a las mujeres lactantes a aumentar la secreción de leche, mitigar la tos, los dolores de anginas  y afecciones respiratorias leves y se  utiliza de forma tradicional para controlar hemorragias vaginales o desinflamar la matriz después del parto.",
    preparation: "Hierve el agua. Retírala del fuego y agrega la bráctea de la flor,dejar reposar tapado durante 5 minutos y cuela perfectamente y se toma tibio, preferentemente endulzado con miel. Solo una taza se puede tomar al día.",
    likes: 0,
    comments: [],
  },
  {
    id: "Flor de chañar",
    name: "Flor de chañar",
    image: "https://acdn-us.mitiendanube.com/stores/784/264/products/diseno-sin-titulo-531-3abaa051878302cfc215971914435097-1024-1024.webp",
    description: "Sus flores son pequeñas, de color amarillo intenso, a veces con líneas rojizas. Florece principalmente en primavera y atrae a las abejas y otros insectos polinizadores.",
    uses: "e han utilizado tradicionalmente en preparaciones para aliviar la tos y los resfriados,sus frutos maduros son dulces y comestibles; se usan para preparar dulces y arrope.",
    preparation: "Calentar una taza de agua hasta que hierva.Retirar del fuego y agregar las flores correctamente identificadas.Tapar y dejar reposar unos minutos.Colar antes de utilizar.esta es una descripción general de una práctica tradicional.",
    likes: 0,
    comments: [],
  },
  {
    id: "Yarita",
    name: "Yarita",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUoRP7Rvc3HhrozK6JfEaIxHsd43ewvdtRXgJE_mKoOhoTbVcBhvXvXdut&s=10",
    description: "Es una especie vegetal que tiene forma de cojín abombado y convexo, muy duro, con mucha resina. Crece cerca de los roquedales. Sus hojas son pequeñas y triangulares, de color verde. Tiene frutos amarillos y flores pequeñas rosadas.",
    uses: " Sirve para la matriz como dolores de espalda y fracturas.",
    preparation: "Matriz: Se preparan cocimientos y emplastos. Para la matriz, se pela la raíz de la yarita, se hierve en un litro de agua y se toma dos veces al día.Dolores de espalda y fracturas: Se prepara una cataplasma con la cocción de tres a cinco minutos, combinando hojas de chillka, ch'akatea y resina machacada o molida. Se aplica en la parte afectad.",
    likes: 0,
    comments: [],
  },
  {
    id: "Wira Wira",
    name: "Wira Wira",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBI1p6rkXPd1nRciG6ufxOtUdIFnPeMtNWm0qX4DFUIrQsoBTVOn2b0MQ&s=10",
    description: "Sus hojas alternas son blanquecinas, con pelos en los bordes. Sus flores son amarillentas y sus frutos son pequeños y cilíndricos, con costillas y sin pelos.",
    uses: "Se utiliza para aliviar las afecciones respiratorias,protege el higado mejora la digestiòn y funciona para reducir la fiebre.",
    preparation: "Hervir un manojo de hojas, tallos y flores en un litro de agua. Dejar reposar de 3 a 5 minutos y tomar tres veces al día.Otra preparación: Mezclar con eucalipto, borraja, menta y manzanilla.",
    likes: 0,
    comments: [],
  },
  {
    id: "Utumpila",
    name: "Utumpila",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsy81KsR7ns5U78FWPchdqRg3z6FfcQ4_MlIyqGq7qzASxZnnj_Einlk8&s=10",
    description: "Tiene hojas carnosas, simples y opuestas, cubiertas por una sustancia cerosa. Sus flores tienen forma de estrella y son de color amarillo fuerte.",
    uses: "Se utiliza tradicionalmente para tratar problemas de vesícula, dolor de estómago,diarrea y para el dolor del oido.",
    preparation: "Para el dolor de estómago y la diarrea, se pueden machacar o licuar las hojas para consumirlas directamente. También se prepara una infusión con tres a cuatro hojas estrujadas.Para el dolor del oido una hojita se parte en dos y la aguita que contiene se hecha al oido.",
    likes: 0,
    comments: [],
  },
  {
    id: "Ruda",
    name: "Ruda",
    image: "https://i0.wp.com/elrincon-verde.club/wp-content/uploads/2019/12/ruda4-e1576185930888.jpg?fit=400%2C400&ssl=1",
    description: "Hierba de hasta 2 m de altura, con olor aromático, fuerte y característico. Rizoma leñoso y ramificado, tallo de base leñosa, ramificado. Hojas de color verde azulado, divididas en segmentos ovales espatulados y glaucos. Flores amarillas, en ramille­tes laxos. Fruto tipo cápsula..",
    uses: "Mal de aire, parálisis facial y dolor de oído,funciona como un tònico estomagal que estimula la funciòn vilial, a alivia la pesadez,reduce los gases,combate con los paràsitos intestinales y ayuda a tratar las varices y problemas de circulaciòn.",
    preparation: "Dolor de oído: Frotarse con hojas verdes quemadas alrededor del oído, como tratamiento hasta sanar.Mal de aire y parálisis facial: Uso externo. Quemar la planta para humear, combinando con hojas y tallos de lampaya y thola en el dormitorio del enfermo. Otra forma es frotar la parte afectada durante las noches hasta sentir mejoría.Mezcla o combinaciones: Para el mal de aire y la parálisis facial, combinar con lampaya.",
    likes: 0,
    comments: [],
  },
  {
    id: "Queñua",
    name: "Queñua",
    image: "https://thumbs.dreamstime.com/b/bosque-de-quenoa-en-el-parque-natural-de-sajama-bolivia-63111497.jpg",
    description: "La queñua es un árbol o arbusto que mide entre 1 y 3 metros de altura. Tiene hojas pequeñas que crecen en las puntas de sus ramas, flores y frutos cubiertos de pequeñas espinas..",
    uses: "Se utiliza tradicionalmente para aliviar las afecciones respiratorias, el reumatismo, el dolor de estómago y la diarrea,para problemas renales y urinarios,tambien es bueno para la diabetes.",
    preparation: "Para las afecciones respiratorias: Se prepara una infusión con la corteza machacada.una cucharilla por taza.Para el reumatismo: Se prepara un baño de vapor con ramas y hojas de queñua, mezcladas con chakatea, kiswara y eucalipto.Para el dolor de estómago y la diarrea:hervir de dos a tres ramas en dos litros de agua.",
    likes: 0,
    comments: [],
  },
  {
    id: "Palqui",
    name: "Palqui",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQg_znH6imrNmK5ZJ8P1XRh6R7suMgLiJ6VmNRTSLyFfHrekQpLHx_caz0&s=10",
    description: "Tiene ramas con espinas, corteza de color marrón oscuro y una copa globosa y extendida. Sus flores son de color amarillo claro y están agrupadas en pequeños racimos. Sus frutos son vainas comprimidas que, al madurar, adquieren un color marrón claro.",
    uses: "Se utiliza tradicionalmente para aliviar afecciones respiratorias,fiebre,resfrios y problemas pulmonares.",
    preparation:"Tomar una o dos flores para una taza.De fruto y semillas molidas tomar en forma de cafè tomar tres veces al dia por quince dias.En fruto machacado mezclado con hojas de eucalipto es usado de form cataplasma para la pulmonìa",
    likes: 0,
    comments: [],
  },
  {
    id: "kilkina",
    name: "kilkina",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Quirquina_mature1.jpg?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original",
    description: "Tiene ramas desde la base, hojas generalmente opuestas y flores pequeñas de color blanco amarillento o amarillo. Sus frutos son pequeños, de forma alargada y con aspecto algo peludo.",
    uses: "Se utiliza tradicionalmente para aliviar el dolor de estómago y prevenir el estreñimiento tambien ayuda a regular la presion arterial. problemas del hígado y dolor de cabeza.Sus hojas triduradas se aplican para ayudar a desinflmar y cicatrizar quemaduras leves.",
    preparation: "Hervir de dos a tres ramas de la planta para dos litros de agua y tomar dos veces por dìa.",
    likes: 0,
    comments: [],
  },
  {
    id: "Matico",
    name: "Matico",
    image: "https://pbs.twimg.com/media/DViKjbwW4AAwqK_?format=webp&name=large",
    description: "Es un arbusto de hojas verdes, alargadas y aromáticas, con pequeñas flores agrupadas en espigas.",
    uses: "Usado para el tratamiento de afecciones respiratorias como la tos, resfrío, gripe, bronquitis, neumonía y fiebre. Posee propiedades antimicrobianas y cicatrizantes, regula la digestión. Asimismo, se usa para el tratamiento de hemorragias, pues tiene la propiedad de actuar como hemostático (detener la hemorragia), también para tratar dolores de bajo vientre y como regulador de la menstruación y contribuye a aliviar molestias estomagales y ulceras.",
    preparation: "Picar o triturar 2 hojas de matico luego colocar en un litro de agua hirviendo, tapar y hacer reposar entre 5 a 15 minutos, luego colar y beber una taza de la infusión tres veces al día, durante 7 días o una semana.Para tratar aftas de la boca: hacer gárgaras con la infusión, durante tres días.",
    likes: 0,
    comments: [],
  },
  {
    id: "Jarca",
    name: "Jarca",
    image: "https://www.plantasyhongos.es/herbarium/a/Acacia_visco_03.jpg",
    description: "La jarca es un árbol nativo de Bolivia que puede alcanzar hasta 15 metros de altura. Tiene una corteza pardo-grisácea o pardo-rojiza, muy agrietada, y una copa abierta. Sus hojas son compuestas y sus flores son de color amarillo pálido. Su fruto es una vaina de color pardo-grisáceo que contiene semillas aplanadas..",
    uses: "Se utiliza tradicionalmente para aliviar el dolor de estómago,para dolores musculares y articulares,y gracias a sus propiedades se usa en lavados para combatir hogos,el mal olor ,estimula el crecimiento de cabello y desinfectar pequeñas heridas.",
    preparation: "Hervir de dos a tres ramas con hojas de aproximadamente 15 cm en un litro de agua.",
    likes: 0,
    comments: [],
  },
  {
    id: "Churqui",
    name: "Churqui",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Churqui_en_flor.jpg/500px-Churqui_en_flor.jpg?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=thumbnail",
    description: "El churqui es un arbusto de 2 a 5 metros de altura, con tronco corto y ramas con espinas. Tiene hojas compuestas, flores doradas y frutos cilíndricos, gruesos y amarillos.",
    uses: "Se utiliza tradicionalmente para tratar la diarrea, el posparto y problemas de próstata.",
    preparation: "Para la diarrea y la próstata: Tostar un fruto, molerlo hasta obtener un polvo y tomarlo en forma de café. El texto indica tres veces al día para la diarrea y dos veces al día durante 15 días para la próstata.Para el posparto: Hervir de dos a tres puntas de ramas en un litro de agua y tomar como agua de tiempo o tres veces al día durante 15 días.",
    likes: 0,
    comments: [],
  },
  {
    id: "Pino",
    name: "Pino",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQJbEJNytQvSGeb7nvEEndjElblHJOPVRyyRUsNfj-qw&s=10",
    description: "El pino es un árbol de gran tamaño, de tronco fuerte y recto, con una copa formada por numerosas ramas. Sus hojas son largas, delgadas y tienen forma de agujas, generalmente de color verde. Produce conos o piñas, donde se encuentran sus semillas.",
    uses: "Es usada para el tratamiento de la tos, gripe y bronquitis, alivia la congestión de las vías respiratorias y la fiebre, ayuda a la eliminación de flemas y a suavizar la garganta. Favorece a la eliminación de bacterias que causan faringitis. También se usa para tratar el reumatismo y la artritis.",
    preparation: "Infusión para la tos y el resfriado: Hervir una cuchara sopera de yemas de pino (brotes nuevos de las ramas) en un litro de agua, endulzar con miel, dejar enfriar, filtrar y tomar 3 tazas al día durante 3 días.Baños o inhalación de vapor para sinusitis y problemas bronquiales: Colocar dos cucharadas de los brotes nuevos de la planta en un litro de agua, calentar y una vez que entre en ebullición quitar del fuego, luego inhalar el vapor que se genera. También se puede añadir a la preparación de vapor, tres a cinco gotas del aceite esencial de las hojas de la planta.Baños para aliviar los dolores reumáticos: Hacer hervir un puñado de yemas de pino en dos litros de agua por cinco minutos (cocimiento), luego colocar este cocimiento en una bañera, aumentar una cantidad de agua caliente; la temperatura del baño debe ser caliente, pero tolerable. Este remedio tiene propiedades antiinflamatorias y balsámicas.",
    likes: 0,
    comments: [],
  },
  {
    id: "Valeriana",
    name: "Valeriana",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrVWMXPYz04hsgqCtyCDkHx-S-QClEePFN5O2GZ6OPCxucFNosEFGCbRE&s=10",
    description: "La valeriana es una planta medicinal de hojas verdes y flores pequeñas, generalmente blancas o rosadas. Se caracteriza por tener una raíz de olor fuerte, que es la parte más utilizada en la medicina tradicional.",
    uses: "Indicado en trastornos del sueño (insomnio), dolor de cabeza (migraña), ansiedad, estrés, dolores menstruales (dismenorrea), fiebre, convulsión y dolores reumáticos.",
    preparation: "Colocar una cuchara de raíz de valeriana fresca o seca (pulverizada) en una taza de agua hervida, tomar una sola vez por la noche, un par de horas antes de dormir, durante cinco días.Cocción: Colocar tres ramitas de tres cm en un litro de agua, dejar hervir y tomar una taza por la noche.Compresas: Aplicar en el área afectada, una vez por día.Baños de agua caliente: Realizar una vez a la semana..",
    likes: 0,
    comments: [],
  },
  {
    id: "Hinojo",
    name: "Hinojo",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgmBNHaBxvNhfYHdsP8sjuqOnGGACY7CrCa4wTiwgtUosfQzEC9R3UFG-Z&s=10",
    description: "El hinojo es una planta aromática y medicinal de color verde, conocida por su agradable aroma y su sabor ligeramente dulce.",
    uses: "Es una planta con propiedades antioxidante, antiinflamatoria, expectorante y antimicrobiana, por lo que resulta un buen aliado natural para combatir o neutralizar la presencia de microorganismos infecciosos en las vías respiratorias,ayuda a calmar los gases,la hichazòn,còdigos estomagales y estimular la producciòn de la leche materna.",
    preparation: "Añadir una cucharada al ras de semillas de hinojo por cada taza de agua caliente, colar (tamizar) y tomar de 3 tazas diarias (después de las comidas). Para tratar, endulzar con miel.También se puede preparar añadiendo una rama pequeña de hinojo (8 cm aprox.) en una taza de agua hervida, dejar reposar 5 minutos, colar y tamizar y tomar 3 tazas diarias.para lavados oculares, realizar una taza empapada en infusión sobre los ojos cerrados, previamente realizar un exhaustivo lavado de la planta..",
    likes: 0,
    comments: [],
  },
  {
    id: "Ayrampo",
    name: "Ayrampo",
    image: "https://www.infobae.com/new-resizer/64gFwFwoTZ_KvwRpNVy8fw6p-9o=/arc-anglerfish-arc2-prod-infobae/public/4LUOKTIV5NBWLL73RKZLU735DU.jpg",
    description: "Se caracteriza por tener tallos verdes con espinas y frutos pequeños de color rojo intenso o morado. Sus frutos contienen semillas que tradicionalmente se utilizan para preparar bebidas, infusiones y colorantes naturales.En la medicina tradicional, el ayrampo es valorado por sus propiedades refrescantes y antioxidantes,.",
    uses: "Utilizada para bajar la fiebre, para tratar aftas, para el dolor de estómago, dolor de ojo y tambien para aliviar los sintomas de la varicela o sarampion.",
    preparation: "En una taza de agua hervida remojar una cucharilla de semillas de ayrampo, dejar reposar durante 5 minutos, colar (tamizar) y tomar una taza por la mañana y por la noche durante 3 a 5 días.Utilizar el agua de ayrampo para lavar axilas y extremidades inferiores del cuerpo, humedecer permanentemente los labios con algodón remojado en agua de ayrampo.",
    likes: 0,
    comments: [],
  },
  {
    id: "Algarrobo",
    name: "Algarrobo",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvRZrqlrVOgMYL1992SPDUFdo4R75CTA-7z-7Ij_nocQ&s=10",
    description: "El algarrobo es un árbol de tamaño mediano a grande, resistente y adaptado a zonas secas y cálidas. Tiene un tronco fuerte y una copa amplia, con ramas que proporcionan bastante sombra. Sus hojas son pequeñas y verdes, y produce vainas alargadas de color verde que, al madurar, se vuelven marrones y contienen semillas.",
    uses: "Las hojas y el fruto maduro del cupesí estimulan y activan las defensas del organismo, son revitalizantes, antioxidantes, expectorantes. Los frutos tienen propiedad reconstituyente natural, tienen alto contenido de proteínas, minerales, vitaminas y fibra, ayuda a combatir la desnutrición y a tratar la anemia. Las hojas sirven para aliviar la tos de ahogo.",
    preparation: "Recolectar y lavar los frutos maduros amarillos del cupesí o algarrobo, consumirlos directamente mascando y separando las semillas.Infusión: Se coloca un puñado de cogollo (brote tierno de las ramas) de la planta en un litro de agua, se hace hervir y se toma como mate para la tos.Pito: Se muelen los frutos maduros y secos, se mezcla con agua fría, luego se cuela la preparación y se toma un vaso tres veces al día, durante 15 días a un mes.vaporizaciones: Obtener la resina del tronco del árbol realizando un corte en su corteza, colocar una cuchara sopera de la resina obtenida en dos litros de agua hirviendo en olla, retirar del fuego y acercar el rostro con una toalla cubierta en la cabeza luego inhalar o respirar de forma profunda el vapor producido, repetir este tratamiento una sola vez al día, por las noches; se puede apartar un vasito de esta agua para hacer gárgaras.",
    likes: 0,
    comments: [],
  },
  {
    id: "Ajo",
    name: "Ajo",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBEjeNBR4Hp26YFZ1bc002QUXWMDUNc1bYB8ZIUwuKNTxOwLdP2WEIHBk&s=10",
    description: "Es una planta que tiene hojas largas, estrechas y de color verde. Su tallo es corto y crece principalmente bajo tierra..",
    uses: "El ajo aporta con propiedades medicinales beneficiosas para la salud. Es un antibiótico natural, con la peculiaridad de combatir infecciones respiratorias, dilatar los bronquios, humedecer las mucosas, ayuda a eliminar secreciones (expectorante) y fortalece las defensas del organismo.",
    preparation: "Machacar 1 diente de ajo o cortarlo en finas láminas y consumirlo con agua como si fuera una tableta de acuerdo a requerimiento.Otra opción para consumirlo crudo es incluirlo en las comidas 30 minutos antes de terminar de cocinar, para obtener sus bondades o bien a través del consumo de.",
    likes: 0,
    comments: [],
  },
  {
    id: "Malva",
    name: "Malva",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzMrHDmfEyUplYYfobpvPQm3B3uRjxqvyEqIumUUcsxFO-BDUn-vxsPLA8&s=10",
    description: "La malva es una planta medicinal que crece en lugares templados y húmedos. Tiene hojas verdes, suaves y redondeadas, y flores de color rosado o violeta.",
    uses: "Alivia la tos seca, la garganta irritada, la bronquitis, ayuda a calmar la gastritis, la acidez estomacal, las úlceras gástricas y actúa como un laxante suave para el estreñimiento leve.Y  Aplicada lavados, favorece la cicatrización de heridas leves, quemaduras y picaduras de insectos.",
    preparation: "Infusión o té: Se utiliza de 1 a 2 hojas y flores secas por una taza de agua caliente; se deja reposar de 5 a 10 minutos, se cuela y se puede beber hasta 2 o 3 veces al día.Las hojas machacadas o la infusión templada se aplican directamente sobre la piel o se usan para hacer gárgaras.",
    likes: 0,
    comments: [],
  },
  {
    id: "Laurel",
    name: "Laurel",
    image: "https://herbario.istmas.edu.ec/wp-content/uploads/2022/05/laurel.jpg",
    description: "El laurel es una planta aromática que puede crecer como arbusto o árbol pequeño. Tiene hojas verdes, alargadas, brillantes y de olor agradable.",
    uses: "Reduce los gases, la hinchazón, la acidez, facilita la digestión de comidas pesadas ,ayuda a calmar dolores articulares,dolores de cabeza,favorece la expulsión de mocos y alivia la congestión en resfrios, contribuye a mejorar la sensibilidad a la insulina, reducir los niveles de glucosa y colesterol en la sangre, ayudan a disminuir el estrés, la ansiedad y favorecen el descanso.",
    preparation: "Se colocan de 2 a 3 hojas de laurel (secas) en una taza de agua hirviendo, se deja reposar de 10 a 15 minutos ,se cuela y se toma una taza una o dos veces al día.",
    likes: 0,
    comments: [],
  },
  {
    id: "Hierba buena",
    name: "Hierba buena",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRZih4pMglulQ1JxFOQx-5Z7uHvy5YQe5UbnlzZScQiL0C8C7byuseqCZt&s=10",
    description: "Hojas alargadas, dentadas y de aroma fresco. Sus flores son pequeñas y generalmente de color blanco o lila.",
    uses: "Se toma en infusión para aliviar molestias digestivas leves.Disminuir los gases: puede ayudar a aliviar la hinchazón y las flatulencias.Aliviar las náuseas leves: su aroma y su consumo tradicional pueden resultar reconfortantes, aunque la evidencia específica es limitada.Refrescar el aliento: sus hojas aromáticas se utilizan para mejorar temporalmente el olor de la boca.Aportar sabor a los alimentos: se emplea en jugos, sopas, ensaladas y otras preparaciones.",
    preparation: "Lavar bien las hojas.Calentar el agua hasta que hierva.Retirar del fuego y agregar las hojas.Tapar y dejar reposar de 5 a 10 minutos.Colar y beber tibia.",
    likes: 0,
    comments: [],
  },
 
  
      
    ],
    visits: 0,
    pageViews: {},
    likedBy: {},
  };

  // Creamos un objeto global para que los demás archivos JavaScript puedan usarlo.
  window.NaturalStore = {
    // Lee los datos guardados o inicializa una copia de los datos iniciales.
    get() {
      const storedData = localStorage.getItem(KEY);
      const parsedData = storedData === null ? null : JSON.parse(storedData);
      const data = parsedData && typeof parsedData === "object" && !Array.isArray(parsedData)
        ? parsedData
        : JSON.parse(JSON.stringify(initialData));

      // Restaura una sola vez los textos originales del catálogo en las copias
      // locales existentes, conservando likes, comentarios y datos de usuarios.
      if (localStorage.getItem(PLANT_TEXT_RESTORED_KEY) !== "1") {
        const plants = Array.isArray(data.plants) ? data.plants : [];
        const originalPlants = new Map(initialData.plants.map((plant) => [plant.id, plant]));
        const existingIds = new Set();

        data.plants = plants.map((plant) => {
          if (!plant || typeof plant !== "object") return plant;
          existingIds.add(plant.id);
          const original = originalPlants.get(plant.id);
          return original
            ? {
                ...plant,
                description: original.description,
                uses: original.uses,
                preparation: original.preparation,
              }
            : plant;
        });

        initialData.plants.forEach((plant) => {
          if (!existingIds.has(plant.id)) {
            data.plants.push(JSON.parse(JSON.stringify(plant)));
          }
        });

        this.save(data);
        localStorage.setItem(PLANT_TEXT_RESTORED_KEY, "1");
        return data;
      }

      // Inicializa el almacenamiento con una copia en la primera lectura.
      if (storedData === null) this.save(data);
      return data;
    },

    // Convierte el objeto en texto y lo guarda en el navegador.
    save(data) {
      localStorage.setItem(KEY, JSON.stringify(data));
    },

    // Crea un identificador diferente para usuarios, plantas y comentarios nuevos.
    id() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    },

    // Busca al usuario que inició sesión anteriormente.
    currentUser() {
      const id = localStorage.getItem("naturalAppSession");
      return this.get().users.find((user) => user.id === id) || null;
    },

    // Guarda el id del usuario que acaba de iniciar sesión.
    setUser(id) {
      localStorage.setItem("naturalAppSession", id);
    },

    // Borra la sesión, pero no borra los usuarios ni las plantas.
    logout() {
      localStorage.removeItem("naturalAppSession");
    },

    // Suma una visita total y otra para la página que se abrió.
    recordVisit(page) {
      const data = this.get();
      data.visits += 1;
      data.pageViews[page] = (data.pageViews[page] || 0) + 1;
      this.save(data);
    },
  };
})();
