const POKEAPI_URL="https://pokeapi.co/api/v2/pokemon/";
const formulario=document.querySelector("#formulario");

formulario.addEventListener("submit",buscarPokemon);

async function buscarPokemon(evento){
    evento.preventDefault();

    const pokemon=document.querySelector("#pokemon").value.toLowerCase().trim();
    const mensaje=document.querySelector("#mensaje");
    const resultado=document.querySelector("#resultado");

    mensaje.textContent="Buscando, dame chance";
    resultado.style.display="none";
    document.querySelector("#descripcion").innerHTML="";
    document.querySelector("#evoluciones").innerHTML="";

    try{
        const consulta=await fetch(POKEAPI_URL+pokemon);

        if(!consulta.ok){
            throw new Error("No se encontro el Pokemon");
        }

        const datos=await consulta.json();

        document.querySelector("#nombre").textContent=datos.name.toUpperCase();
        document.querySelector("#id").textContent=`ID: ${datos.id}`;
        document.querySelector("#imagen").src=datos.sprites.front_default;

        resultado.style.display="block";
        mensaje.textContent="";

        const especie=await buscarDescripcion(datos.species.url);
        await buscarEvoluciones(especie);

    }catch(error){
        mensaje.textContent=error.message;
    }
}

async function buscarDescripcion(url){
    const consulta=await fetch(url);
    const datos=await consulta.json();

    let texto=datos.flavor_text_entries.find(item=>item.language.name==="es");

    if(!texto){
        texto=datos.flavor_text_entries.find(item=>item.language.name==="es-419");
    }

    let descripcion="No hay descripcion disponible";

    if(texto){
        descripcion=texto.flavor_text.replace(/[\f\n\r]/g," ");
    }

    document.querySelector("#descripcion").innerHTML=
        `<h2>Descripcion</h2>
        <p>${descripcion}</p>`;

    return datos;
}

async function buscarEvoluciones(especie){
    const consulta=await fetch(especie.evolution_chain.url);
    const datos=await consulta.json();
    const contenedor=document.querySelector("#evoluciones");

    contenedor.innerHTML="<h2>Cadena evolutiva</h2>";

    await mostrarPokemon(datos.chain);
}

async function mostrarPokemon(actual){
    const consulta=await fetch(POKEAPI_URL+actual.species.name);
    const datos=await consulta.json();

    const respuestaEspecie=await fetch(actual.species.url);
    const especie=await respuestaEspecie.json();

    const tarjeta=document.createElement("div");
    tarjeta.className="pokemon";
    tarjeta.innerHTML=
        `<h3>${datos.name.toUpperCase()}</h3>
        <img src="${datos.sprites.front_default}">`;

    document.querySelector("#evoluciones").appendChild(tarjeta);

    const megas=especie.varieties.filter(item=>item.pokemon.name.includes("-mega"));

    for(const mega of megas){
        const respuesta=await fetch(mega.pokemon.url);
        const informacion=await respuesta.json();

        const tarjetaMega=document.createElement("div");
        tarjetaMega.className="mega";
        tarjetaMega.innerHTML=
            `<h3>${informacion.name.toUpperCase()}</h3>
            <img src="${informacion.sprites.front_default}">
            <p>Mega evolucion</p>`;

        document.querySelector("#evoluciones").appendChild(tarjetaMega);
    }

    for(const siguiente of actual.evolves_to){
        await mostrarPokemon(siguiente);
    }
}