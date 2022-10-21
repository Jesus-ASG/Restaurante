class Plato {
    constructor(id, nombre, precio, tipo, imagen){
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.imagen = imagen;
        this.tipo = tipo;
    }

    toString(){
        return "id: " +this.id +" nombre: "
        +this.nombre+" precio: "
        +this.precio+" imagen: "+this.imagen+" tipo: "+this.tipo;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // cargar base de datos
    var baseDeDatos = JSON.parse(localStorage.getItem("menu") || "[]");
    // cargar producto editable y si existe borrarlo
    var editable = JSON.parse(localStorage.getItem('editable'));
    if(editable)
        window.localStorage.removeItem('editable');

    let carrito = [];
    const divisa = '$';
    const DOMitems = document.querySelector('#items');
    const DOMcarrito = document.querySelector('#carrito');
    const DOMtotal = document.querySelector('#total');
    const DOMbotonVaciar = document.querySelector('#boton-vaciar');
    const btnOrdenarPedido = document.getElementById('ordenarPedido');
    const btnCerrarRestaurante = document.getElementById('cerrarRestaurante');
    const miLocalStorage = window.localStorage;


    btnOrdenarPedido.addEventListener('click', ordenarPedido);
    btnCerrarRestaurante.addEventListener('click', cerrarRestaurante);

    // Funciones

    /**
    * Dibuja todos los productos a partir de la base de datos. No confundir con el carrito
    */
    function renderizarProductos() {
        DOMitems.textContent = "";
        baseDeDatos = JSON.parse(localStorage.getItem("menu") || "[]");
        baseDeDatos.forEach((info) => {
            // Estructura
            const miNodo = document.createElement('div');
            miNodo.classList.add('card', 'col-sm-5');
            // Body
            const miNodoCardBody = document.createElement('div');
            miNodoCardBody.classList.add('card-body');
            // Titulo
            const miNodoTitle = document.createElement('h5');
            miNodoTitle.classList.add('card-title');
            miNodoTitle.textContent = info.nombre;
            // Imagen
            const miNodoImagen = document.createElement('img');
            miNodoImagen.classList.add('img-fluid');
            miNodoImagen.setAttribute('src', info.imagen);
            // Precio
            const miNodoPrecio = document.createElement('p');
            miNodoPrecio.classList.add('card-text');
            miNodoPrecio.textContent = `${divisa}${info.precio.toFixed(2)}`;
            // Boton 
            const miNodoBoton = document.createElement('button');
            miNodoBoton.classList.add('btn', 'btn-primary');
            miNodoBoton.textContent = '+';
            miNodoBoton.setAttribute('marcador', info.id);
            miNodoBoton.addEventListener('click', anyadirProductoAlCarrito);

            // botón de editar
            const nodoBotonEditar = document.createElement('button');
            nodoBotonEditar.classList.add('btn', 'btn-warning', 'btn-control');
            // ícono de lápiz
            const iconoLapiz = document.createElement('i');
            iconoLapiz.classList.add('fa-solid', 'fa-pen');
            nodoBotonEditar.setAttribute('marcador_editar', info.id);
            nodoBotonEditar.addEventListener('click', editarPlato);
            nodoBotonEditar.appendChild(iconoLapiz);

            // botón de borrar
            const nodoBotonBorrar = document.createElement('button');
            nodoBotonBorrar.classList.add('btn', 'btn-danger', 'btn-control');
            // ícono de lápiz
            const iconoBorrar = document.createElement('i');
            iconoBorrar.classList.add('fa-solid', 'fa-trash');
            nodoBotonBorrar.setAttribute('marcador_borrar', info.id);
            nodoBotonBorrar.addEventListener('click', borrarPlato);
            nodoBotonBorrar.appendChild(iconoBorrar);

            // categoría
            const nodoCategoria = document.createElement('h6');
            nodoCategoria.classList.add('card-title', 'cursiva');
            let tipo_temp = info.tipo.charAt(0).toUpperCase() + info.tipo.slice(1);
            nodoCategoria.textContent = tipo_temp;



            // Insertamos
            miNodoCardBody.appendChild(miNodoImagen);
            miNodoCardBody.appendChild(miNodoTitle);
            miNodoCardBody.appendChild(nodoCategoria);
            miNodoCardBody.appendChild(miNodoPrecio);
            miNodoCardBody.appendChild(miNodoBoton);
            ///
            miNodoCardBody.appendChild(nodoBotonEditar);
            miNodoCardBody.appendChild(nodoBotonBorrar);

            miNodo.appendChild(miNodoCardBody);
            DOMitems.appendChild(miNodo);
        });
    }

    /**
    * Evento para añadir un producto al carrito de la compra
    */
    function anyadirProductoAlCarrito(evento) {
        // Anyadimos el Nodo a nuestro carrito
        carrito.push(evento.target.getAttribute('marcador'))
        // Actualizamos el carrito 
        renderizarCarrito();
        // Actualizamos el LocalStorage
        guardarCarritoEnLocalStorage();
    }

    function editarPlato(e){
        const id = e.target.getAttribute('marcador_editar');
        // buscar ese plato
        var plato;
        for(let i=0; i<baseDeDatos.length; i++){
            if (baseDeDatos[i].id == id){
                plato = baseDeDatos[i];
                break;
            }
        }

        if (plato){
            window.localStorage.setItem('editable', JSON.stringify(plato));
            window.location.href = "form.html";
        }
        
    }

    function borrarPlato(e){
        const id = e.target.getAttribute('marcador_borrar');
        if (!id)
            return;
        let confirmar = confirm('¿Seguro que desea borrar este plato');
        if (confirmar){
            
            baseDeDatos = baseDeDatos.filter((plato) => {
                return plato.id != id;
            });
            window.localStorage.setItem('menu', JSON.stringify(baseDeDatos));
            renderizarProductos();
        }
    }

    /**
    * Dibuja todos los productos guardados en el carrito
    */
    function renderizarCarrito() {
        // Vaciamos todo el html
        DOMcarrito.textContent = '';
        // Quitamos los duplicados
        const carritoSinDuplicados = [...new Set(carrito)];
        // Generamos los Nodos a partir de carrito
        carritoSinDuplicados.forEach((item) => {
            // Obtenemos el item que necesitamos de la variable base de datos
            const miItem = baseDeDatos.filter((itemBaseDatos) => {
                // ¿Coincide las id? Solo puede existir un caso
                return itemBaseDatos.id === parseInt(item);
            });
            // Cuenta el número de veces que se repite el producto
            const numeroUnidadesItem = carrito.reduce((total, itemId) => {
                // ¿Coincide las id? Incremento el contador, en caso contrario no mantengo
                return itemId === item ? total += 1 : total;
            }, 0);
            // Creamos el nodo del item del carrito
            const miNodo = document.createElement('li');
            miNodo.classList.add('list-group-item', 'text-right', 'mx-2');
            miNodo.textContent = `${numeroUnidadesItem} x ${miItem[0].nombre} - ${divisa}${miItem[0].precio}`;
            // Boton de borrar
            const miBoton = document.createElement('button');
            miBoton.classList.add('btn', 'btn-danger', 'mx-5');
            miBoton.textContent = 'X';
            miBoton.style.marginLeft = '1rem';
            miBoton.dataset.item = item;
            miBoton.addEventListener('click', borrarItemCarrito);
            // Mezclamos nodos
            miNodo.appendChild(miBoton);
            DOMcarrito.appendChild(miNodo);
        });
        // Renderizamos el precio total en el HTML
        DOMtotal.textContent = calcularTotal();
    }

    /**
    * Evento para borrar un elemento del carrito
    */
    function borrarItemCarrito(evento) {
        // Obtenemos el producto ID que hay en el boton pulsado
        const id = evento.target.dataset.item;
        // Borramos todos los productos
        carrito = carrito.filter((carritoId) => {
            return carritoId !== id;
        });
        // volvemos a renderizar
        renderizarCarrito();
        // Actualizamos el LocalStorage
        guardarCarritoEnLocalStorage();

    }

    /**
     * Calcula el precio total teniendo en cuenta los productos repetidos
     */
    function calcularTotal() {
        // Recorremos el array del carrito 
        return carrito.reduce((total, item) => {
            // De cada elemento obtenemos su precio
            const miItem = baseDeDatos.filter((itemBaseDatos) => {
                return itemBaseDatos.id === parseInt(item);
            });
            // Los sumamos al total
            return total + miItem[0].precio;
        }, 0).toFixed(2);
    }

    /**
    * Varia el carrito y vuelve a dibujarlo
    */
    function vaciarCarrito() {
        // Limpiamos los productos guardados
        carrito = [];
        // Renderizamos los cambios
        renderizarCarrito();
        // Borra LocalStorage
        //localStorage.clear();
        localStorage.removeItem('carrito');

    }

    function guardarCarritoEnLocalStorage () {
        miLocalStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function cargarCarritoDeLocalStorage () {
        // ¿Existe un carrito previo guardado en LocalStorage?
        if (miLocalStorage.getItem('carrito') !== null) {
            // Carga la información
            carrito = JSON.parse(miLocalStorage.getItem('carrito'));
        }
    }

    function ordenarPedido(){
        var dinero_total = window.localStorage.getItem('total');
        if (!dinero_total){
            dinero_total = 0;
            window.localStorage.setItem('total', dinero_total);
        }
        
        var total_pedido = document.getElementById('total').innerText;
        dinero_total = parseFloat(dinero_total) + parseFloat(total_pedido);
        window.localStorage.setItem('total', dinero_total);

        alert('Pedido realizado correctamente');
        vaciarCarrito();
    }

    function cerrarRestaurante(){
        var confirmar = confirm("¿Desea cerrar el restaurante?");
        if(!confirmar)
            return;
            window.location.href = "mostrar_ganancias.html";
    }


    // Eventos
    DOMbotonVaciar.addEventListener('click', vaciarCarrito);

    // Inicio
    cargarCarritoDeLocalStorage();
    renderizarProductos();
    renderizarCarrito();



});