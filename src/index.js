import { dragAndDrop } from './js/dragAndDrop';
import './styles/app.scss';


const states = {
    1: 0,
    0: 1
}

const changeThemeColor = () => {
    const $root = document.documentElement;

    $root.classList.toggle('theme-dark');
    $root.classList.toggle('theme-light');

    const theme = $root.className;
    localStorage.setItem('todoAppThemeColor', theme);
}

const setInitialTheme = () => {
    if (!localStorage.getItem('todoAppThemeColor')) {
        localStorage.setItem('todoAppThemeColor', 'theme-dark');
    }
    const theme = localStorage.getItem('todoAppThemeColor');
    document.documentElement.classList.add(theme);
}

const countItemsLeft = () => {
    const todos = JSON.parse(localStorage.getItem('fmTodos')) || [];
    const number = todos.filter(todo => todo.state == 1).length;
    document.getElementById('countItemsLeft').textContent = `${number} items left`;
}


const changeState = (id, state) => {
    const todos = JSON.parse(localStorage.getItem('fmTodos'));
    document.getElementById(id).dataset.state = state;
    const updatedTodos = todos.map(singleTodo =>
        singleTodo.id == id
            ? { id: singleTodo.id, todo: singleTodo.todo, state }
            : singleTodo);

    localStorage.setItem('fmTodos', JSON.stringify(updatedTodos));

    countItemsLeft();

}

const filterTodos = {
    todos: () => Array.from(document.getElementById('list').children),
    all: function () {
        this.todos().forEach(todo => todo.style.display = 'block');
    },
    active: function () {
        const completedTodos = this.todos().filter(todo => todo.dataset.state == 0);
        this.all();
        completedTodos.forEach(todo => todo.style.display = 'none');
    },
    completed: function () {
        const activeTodos = this.todos().filter(todo => todo.dataset.state == 1);
        this.all();
        activeTodos.forEach(todo => todo.style.display = 'none');
    }
}

const updateList = () => {
    const currentFilter = document.querySelector('.list__span--active').dataset.filter;
    currentFilter !== 'all' && filterTodos[currentFilter]();

}


const completeAll = () => {
    document.querySelectorAll('.list-item').forEach($e => {
        $e.classList.add('list-item--completed');
        changeState($e.id, 0);

    });

    updateList();
}
const activeAll = () => {
    document.querySelectorAll('.list-item').forEach($e => {
        $e.classList.remove('list-item--completed');
        changeState($e.id, 1);
    });

    updateList();

}

const checkSingleTask = $item => {
    $item.classList.toggle('list-item--completed');
}

const deleteTodo = id => {

    document.getElementById(id)?.remove();
    const todos = JSON.parse(localStorage.getItem('fmTodos'));

    const updatedTodos = todos.filter(todo => todo.id != id);
    localStorage.setItem('fmTodos', JSON.stringify(updatedTodos));

    countItemsLeft();
}


const activeCurrentFilter = (key) => {
    const elements = {
        all: [0, 3],
        active: [1, 4],
        completed: [2, 5]
    }
    const [firstIndex, secondIndex] = elements[key];

    const filters = document.querySelectorAll('.list__span');
    filters.forEach(filter => filter.classList.remove('list__span--active'));
    filters[firstIndex].classList.add('list__span--active');
    filters[secondIndex].classList.add('list__span--active');
}




const clearCompleted = () => {
    const todos = JSON.parse(localStorage.getItem('fmTodos'));

    todos.forEach(todo =>
        todo.state === 0 && deleteTodo(todo.id));
    //if todo state is 0 then delete
}

const addTodoInLocalStorage = todo => {

    const todos = JSON.parse(localStorage.getItem('fmTodos'));
    const updatedTodos = [todo, ...todos];
    localStorage.setItem('fmTodos', JSON.stringify(updatedTodos));
    countItemsLeft();

}


const createTemplate = ({ id, todo, state }) => {
    const className = state === 0 ? 'list-item--completed' : '';
    return `
    <li class="list-item ${className}" id=${id} data-id=${id} data-state=${state} >
        <div class="list-item__content">
            <div class="list-item__left">
                <div class="chk-border">
                    <div class="chk"></div>
                </div>
            </div>
            <p class="list-item__text">${todo}</p>
            <div class="list-item__right">
                <div class="list-item__delete"></div>
            </div>
        </div>
    </li>`
};

const listTodos = todos => {
    const $list = document.getElementById('list');

    let $todos = '';

    todos.
        forEach(singleTodo => $todos += createTemplate(singleTodo));


    $list.innerHTML = $todos;
    countItemsLeft();
}

const loadInitialTodos = () => {

    if (!localStorage.getItem('fmTodos')) {
        localStorage.setItem('fmTodos', '[]');
    }

    countItemsLeft();
    if (localStorage.getItem('fmTodos')) {

        const todos = JSON.parse(localStorage.getItem('fmTodos'));

        listTodos(todos);

        countItemsLeft();
        activeCurrentFilter('all');
    }
}

const addTodo = (todo) => {
    const $list = document.getElementById('list');
    const $item = createTemplate(todo);

    $list.insertAdjacentHTML('afterbegin', $item);
    addTodoInLocalStorage(todo);

    filterTodos['all']();
    activeCurrentFilter('all');
}

document.addEventListener('click', e => {
    switch (true) {
        case e.target.matches('#changeTheme'):
            changeThemeColor();
            break;
        case e.target.matches('#checkAll'):

            e.target.closest('form')
                .classList.contains('list-item--completed')
                ? activeAll()
                : completeAll();

            break;
        case e.target.matches('.chk'):
            const $item = e.target.closest('li');
            const state = states[$item.dataset.state];
            checkSingleTask($item);
            changeState($item.id, state);
            updateList();
            break;
        case e.target.matches('.list-item__delete'):
            deleteTodo(e.target.closest('li').id);
            break;
        case e.target.matches('.list__span'):

            const filterBy = e.target.dataset.filter;

            const currentFilter = document.querySelector('.list__span--active').dataset.filter;

            filterBy !== currentFilter && filterTodos[filterBy]();

            activeCurrentFilter(filterBy);

            break;
        case e.target.matches('.list__clear'):
            clearCompleted();
            break;

    }

});

document.getElementById('form').addEventListener('submit', e => {
    e.preventDefault();
    const id = Date.now();
    const todoObj = {
        id,
        todo: e.target.todo.value.trim(),
        state: 1
    }
    if (todoObj.todo !== '' && todoObj.todo.length < 200) {
        addTodo(todoObj);
        e.target.reset();
    }
});


document.addEventListener('DOMContentLoaded', () => {
    setInitialTheme();
    loadInitialTodos();
    dragAndDrop();
});