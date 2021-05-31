import Sortable from 'sortablejs';
export const dragAndDrop = () => {
    new Sortable(document.getElementById('list'), {
        animation: 150,
        easing: "cubic-bezier(1, 0, 0, 1)",
        store: {
            set: sortable => {
                const order = sortable.toArray();
                const todos = JSON.parse(localStorage.getItem('fmTodos'));
                const orderedTodos = order.map(id => todos.find(todo => todo.id == id));
                localStorage.setItem('fmTodos', JSON.stringify(orderedTodos));
            },
            get: () => {
                const todos = JSON.parse(localStorage.getItem('fmTodos'));
                const orderedIds = todos.map(todo => todo.id);
                return orderedIds || [];
            }
        }
    });
}