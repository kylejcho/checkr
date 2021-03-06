import { slideInTaskView } from "./animations";
import { allTasks, getLocalData} from "./create-task";
import { checkEmptySubGroup, runEventHandlers } from "./event-handlers";
import { isToday, isTomorrow, isThisWeek, startOfToday, isAfter, endOfDay, isSameDay } from "date-fns";
import { formatDate, getDayOfMonth, isMorning, isAfternoon, within7Days, getMonth, getYear, isOverDue} from "./dates";
import { makeCalendar } from "./calendar"

export const initialPageLoad = () => {
    loadingScreen();
    createTasksContainer('home');
    createCalendarIcon(); 
    createCalendarMonth(getMonth());
    makeCalendar(new Date());
    getLocalData();
    updateCounter();
    runEventHandlers();
}

const loadingScreen = () => {
    const loadingScreen = document.querySelector("#loadingScreen");
    window.addEventListener('load', () => {
        document.body.style.overflowY= "hidden";
        setTimeout(()=> loadingScreen.style.opacity = "0", 400)
        setTimeout(()=> {
            loadingScreen.remove();
            document.body.style.overflowY= "visible";
        }, 900)
    });
}

export const clearContent = () => {
    const tasksContainer = document.querySelector('.tasksContainer');
    tasksContainer.style.opacity = 0;
    
    const taskViewContainer = document.querySelector('.taskViewContainer');
    if (taskViewContainer) {
        taskViewContainer.style.opacity = 0;
    }
    
    setTimeout(() => {
        if (tasksContainer) {
            tasksContainer.remove();
        }
        if (taskViewContainer) {
            taskViewContainer.remove();
        }
    }, 300);
}

const createCalendarIcon = () => {
    const todayIconNumber = document.querySelector('.todayIconNumber')
    todayIconNumber.innerHTML = getDayOfMonth(startOfToday());
}

export const createTasksContainer = (type, list) => {
    const tasksContainer = document.createElement('div');
    tasksContainer.className = "tasksContainer";
    if (list == 'list') {
        tasksContainer.id = type + "ListContainer";
    } else {
        tasksContainer.id = type + "Container";
    }
    
    const tasksContainerTitle = document.createElement('div');
    tasksContainerTitle.id = 'titleContainer';
    tasksContainerTitle.className = "tasksTitle";
    tasksContainer.append(tasksContainerTitle);

    if (type == 'today') {
        tasksContainerTitle.innerText = "Today's Tasks";
        createSubGroups('today', tasksContainer);
        allTasks.forEach((task)=> {
            if (isToday(task.dueDate)) {
                setTimeout(() => createTaskContainer(task.name, task.description, task.dueDate, task.status, task.key, 'loaded'), 10);
            }
        })
    } else if (type == 'week') {
        tasksContainerTitle.innerText = "Next 7 Days";
        createAllSubGroups(tasksContainer)
        allTasks.forEach((task)=> {
            if (within7Days(task.dueDate)) {
                setTimeout(() => createTaskContainer(task.name, task.description, task.dueDate, task.status, task.key, 'loaded'), 10);
            }
        })
    } else if (type == 'home' || type == 'allTasks') {
        if (type == 'home') {
            createHomeGreeting(tasksContainerTitle)
        } else {
            tasksContainerTitle.innerText = "All Tasks";
        }
        createAllSubGroups(tasksContainer)
        allTasks.forEach((task)=> {
            setTimeout(() => {
                isOverDue(task.dueDate)
                createTaskContainer(task.name, task.description, task.dueDate, task.status, task.key, 'loaded');
            }, 10);
        })
    } else {
        tasksContainerTitle.innerText = type;
        createAllSubGroups(tasksContainer)
        allTasks.forEach((task)=> {
            if (task.list == type) {
                setTimeout(() => createTaskContainer(task.name, task.description, task.dueDate, task.status, task.key, 'loaded'), 10);
            }
        })
    }

    const contentContainer = document.querySelector('#contentContainer');
    contentContainer.append(tasksContainer);
    tasksContainer.style.pointerEvents = "none";
    setTimeout(() => {
        const subGroups = document.querySelectorAll('.subGroup')
        subGroups.forEach(subGroup => checkEmptySubGroup(subGroup))
    }, 10);
    setTimeout(() => tasksContainer.style.pointerEvents = "unset", 500);
}

export const createSubGroups = (group, tasksContainer) => {
    const subGroup = document.createElement('div');
    subGroup.className = "subGroup";
    subGroup.id = group;

    const subGroupTitle = document.createElement('p');
    subGroupTitle.className = "subGroupTitle";
    subGroupTitle.innerText = group[0].toUpperCase() + group.slice(1);
    subGroup.append(subGroupTitle);

    if (group == 'overdue') {
        tasksContainer.insertBefore(subGroup, tasksContainer.children[1])
        subGroup.children[0].classList.toggle('overdue')
    } else {
        tasksContainer.append(subGroup);
    }
}   

const createAllSubGroups = (tasksContainer) => {
    createSubGroups("today", tasksContainer, 'loaded');
    createSubGroups("tomorrow", tasksContainer, 'loaded');
    createSubGroups("upcoming", tasksContainer, 'loaded');
}

const createHomeGreeting = (tasksContainerTitle) => {
    if (isMorning()) {
        tasksContainerTitle.innerText = "Good Morning, User";
    } else if (isAfternoon()) {
        tasksContainerTitle.innerText = "Good Afternoon, User";
    } else {
        tasksContainerTitle.innerText = "Good Evening, User";
    }
}

export const createTaskContainer = (task, description, dueDate, status, key, loaded) => {
    const taskContainer = document.createElement('div');
    taskContainer.className = 'taskContainer';
    taskContainer.id = key;

    if (loaded == 'loaded') {
        taskContainer.style.transition = 'none';
        setTimeout(() => {
            taskContainer.style.transition = 'all ease-in-out 0.2s';
        }, 100);
    }

    const checkContainer = document.createElement('div');
    checkContainer.className = 'checkContainer';
    checkContainer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512"><title>ionicons-v5-q</title><circle cx="256" cy="256" r="192" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>'

    const nameContainer = document.createElement('div')
    nameContainer.className ='nameContainer';
    nameContainer.innerText = task;

    const deleteContainer = document.createElement('div');
    deleteContainer.className = 'deleteContainer';
    deleteContainer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512"><title>ionicons-v5-m</title><path d="M256,48C141.31,48,48,141.31,48,256s93.31,208,208,208,208-93.31,208-208S370.69,48,256,48Zm75.31,260.69a16,16,0,1,1-22.62,22.62L256,278.63l-52.69,52.68a16,16,0,0,1-22.62-22.62L233.37,256l-52.68-52.69a16,16,0,0,1,22.62-22.62L256,233.37l52.69-52.68a16,16,0,0,1,22.62,22.62L278.63,256Z"/></svg>';

    const descriptionContainer = document.createElement('div');
    descriptionContainer.className = 'descriptionContainer';
    descriptionContainer.innerText = description;

    taskContainer.append(checkContainer);
    taskContainer.append(nameContainer);
    taskContainer.append(deleteContainer);
    taskContainer.append(descriptionContainer);
    
    let subGroup;
    if (isToday(dueDate)) {
        subGroup = document.querySelector('#today');
    } else if (isTomorrow(dueDate)) {
        if (document.querySelector('.tasksContainer').id != "todayContainer") {
            subGroup = document.querySelector('#tomorrow');
        } else {
            return
        }
    } else if (isAfter(endOfDay(new Date()), dueDate) && !isSameDay(new Date(), dueDate)) {
        subGroup = document.querySelector('#overdue');
    } else {
        subGroup = document.querySelector('#upcoming');
    }

    if (status == 'completed') {
        taskContainer.classList.add('completed');
        taskContainer.children[0].classList.toggle('completed');
        taskContainer.children[1].classList.toggle('completed');
        taskContainer.children[2].classList.toggle('completed');
        taskContainer.children[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512"><title>ionicons-v5-e</title><path d="M256,48C141.31,48,48,141.31,48,256s93.31,208,208,208,208-93.31,208-208S370.69,48,256,48ZM364.25,186.29l-134.4,160a16,16,0,0,1-12,5.71h-.27a16,16,0,0,1-11.89-5.3l-57.6-64a16,16,0,1,1,23.78-21.4l45.29,50.32L339.75,165.71a16,16,0,0,1,24.5,20.58Z"/></svg>';
        subGroup.appendChild(taskContainer);
    } else {
        subGroup.insertBefore(taskContainer, subGroup.children[1]);
    }

    let distance = 60;
    for (let i = 2; i < subGroup.children.length; i++) {
        subGroup.children[i].style.transform = `translateY(${distance}px)`;
        distance += 60;
    }    
    let subGroupHeight = subGroup.children.length * 60; 
    subGroup.style.height = `${subGroupHeight}px`;

    setTimeout(()=> taskContainer.style.opacity = "1", 10) 
    checkEmptySubGroup(subGroup);
}

export const createTaskView = (task, taskContainer) => {
    const taskContainers = document.querySelectorAll('.taskContainer');
    taskContainers.forEach((tasks)=> {
        tasks.classList.remove('viewing')
    })
    taskContainer.classList.toggle('viewing');

    const taskViewContainer = document.createElement('div');
    taskViewContainer.className = 'taskViewContainer';
    taskViewContainer.id = "s" + task.key;

    const taskViewNameContainer = document.createElement('div');
    taskViewNameContainer.className = "taskViewNameContainer";
    taskViewContainer.append(taskViewNameContainer);

    const checkContainer = document.createElement('div');
    checkContainer.className = 'taskViewCheckContainer';
    checkContainer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 512 512"><title>ionicons-v5-q</title><circle cx="256" cy="256" r="192" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>';
    taskViewNameContainer.append(checkContainer);

    const taskViewName = document.createElement('p');
    taskViewName.className = "taskViewName";
    taskViewName.innerText = task.name
    taskViewNameContainer.append(taskViewName);

    const taskViewDescriptionContainer = document.createElement('div');
    taskViewDescriptionContainer.className = "taskViewDescriptionContainer";
    taskViewDescriptionContainer.innerText = "Description:";
    taskViewContainer.append(taskViewDescriptionContainer);

    const taskViewDescription = document.createElement('p');
    taskViewDescription.className = "taskViewDescription";
    taskViewDescription.innerText = task.description;
    taskViewDescriptionContainer.append(taskViewDescription)

    const taskViewDueDateContainer = document.createElement('div');
    taskViewDueDateContainer.className = "taskViewDueDateContainer";
    taskViewDueDateContainer.innerText = "Due:";
    taskViewContainer.append(taskViewDueDateContainer);

    const taskViewDueDate = document.createElement('div');
    taskViewDueDate.className = "taskViewDueDate";

    const dueDate = formatDate(task.dueDate)
    const caret = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512"><title>ionicons-v5-b</title><path d="M190.06,414,353.18,274.22a24,24,0,0,0,0-36.44L190.06,98c-15.57-13.34-39.62-2.28-39.62,18.22V395.82C150.44,416.32,174.49,427.38,190.06,414Z"/></svg>'
    if (isToday(task.dueDate)) {
        taskViewDueDate.innerHTML = `Today ${caret} ${dueDate}`;
    } else if (isTomorrow(task.dueDate)) {
        taskViewDueDate.innerHTML = `Tomorrow ${caret} ${dueDate}`;
    } else {
        taskViewDueDate.innerHTML = dueDate;
    }
    taskViewDueDateContainer.append(taskViewDueDate);

    if (task.list != undefined) {
        const taskViewListContainer = document.createElement('div');
        taskViewListContainer.className = "taskViewListContainer";
        taskViewListContainer.innerText = "List:";
        taskViewContainer.append(taskViewListContainer);

        const taskViewList = document.createElement('div');
        taskViewList.className = "taskViewList";
        const taskViewListP = document.createElement('p');
        taskViewListP.innerText = task.list;
        const dot = document.createElement('div');
        dot.className = 'dot';

        taskViewList.append(dot);
        taskViewList.append(taskViewListP);
        taskViewListContainer.append(taskViewList);
    }

    const tasksContainer = document.querySelector('.tasksContainer');
    tasksContainer.style.transition = "all 0.25s cubic-bezier(0.5, 0, 0.5, 1)";

    if (taskContainer.className.includes('completed')) {
        checkContainer.style.animation = "checkClick 0.3s ease-out";
        checkContainer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 512 512"><title>ionicons-v5-e</title><path d="M256,48C141.31,48,48,141.31,48,256s93.31,208,208,208,208-93.31,208-208S370.69,48,256,48ZM364.25,186.29l-134.4,160a16,16,0,0,1-12,5.71h-.27a16,16,0,0,1-11.89-5.3l-57.6-64a16,16,0,1,1,23.78-21.4l45.29,50.32L339.75,165.71a16,16,0,0,1,24.5,20.58Z"/></svg>';
        taskViewName.classList.toggle('completed');
        checkContainer.classList.toggle('completed');
    }                 
    slideInTaskView(taskViewContainer);
}


export const isOverflowing = (e) => {
    return e.scrollWidth > e.clientWidth;
}

export const decreaseFontSize = () => {
    const taskViewContainer = document.querySelector('.taskViewContainer')
    const name = document.querySelector(".taskViewName");
    while (taskViewContainer && isOverflowing(taskViewContainer.children[0])) {
        const computedFontSize = window.getComputedStyle(name).fontSize;
        const fontSize = parseInt(computedFontSize.substring(0, computedFontSize.length - 2));
        name.style.fontSize = `${fontSize - 1}px`;
    }
}

export const updateCounter = () => {
    let count = 0;
    let todayCount = 0;
    let weekCount = 0;

    allTasks.forEach(task => {
        count++
        if (isToday(task.dueDate)) {
            todayCount++
        } 
        if (isThisWeek(task.dueDate)) {
            weekCount++;
        } 
    })

    const todayCountDiv = document.querySelector('#todayCount');
    const weekCountDiv = document.querySelector('#weekCount');
    const allCountDiv = document.querySelector('#allCount');
    todayCountDiv.innerText = todayCount;
    weekCountDiv.innerText = weekCount;
    allCountDiv.innerText = count;
}

export const createSidebarList = (list) => {
    const sidebarLists = document.querySelector('#sidebarLists');
    const sidebarListContainer = document.createElement('div');
    sidebarListContainer.className = 'sidebarListContainer';
    sidebarListContainer.classList.add('sidebarTab')
    sidebarLists.append(sidebarListContainer)

    const dot = document.createElement('div');
    dot.className = 'dot';

    const listName = document.createElement('p');
    listName.innerText = list;

    sidebarListContainer.append(dot)
    sidebarListContainer.append(listName);
    setListsCloseHeight();
}

const setListsCloseHeight = () => {
    /*
    const sidebarListsClose = document.querySelector('#sidebarListsClose');
    const sidebarLists = document.querySelector('#sidebarLists');
    const sidebarListsHeight = sidebarLists.offsetHeight;
    sidebarListsClose.style.height = `${sidebarListsHeight}px`;
    */
}

export const createInputListItem = (item) => {
    const inputListOptions = document.querySelector('#inputListOptions')
    const inputListItem = document.createElement('p');
    inputListItem.className = 'inputListItem';
    inputListItem.innerText = item; 
    inputListItem.id = item + 'List';  
    inputListOptions.append(inputListItem);
}

export const createSearchResultItem = (item, description, key) => {
    const searchResultCircle = document.createElement('div');
    searchResultCircle.className = 'searchResultCircle';
    searchResultCircle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512"><title>ionicons-v5-q</title><circle cx="256" cy="256" r="192" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>';

    const searchResultItem = document.createElement('div');
    searchResultItem.className = 'searchResultItem';
    searchResultItem.classList.add('hidden')
    searchResultItem.id = 'search' + key;  

    const searchResultName = document.createElement('p');
    searchResultName.className = 'searchResultName';
    searchResultName.innerText = item; 

    const searchResultDescription = document.createElement('p');
    searchResultDescription.className = 'searchResultDescription';
    if (description) {
        searchResultDescription.innerText = description; 
    } else {
        searchResultDescription.innerText = '-'
    }

    const searchResultArrow = document.createElement('div');
    searchResultArrow.className = 'searchResultArrow';
    searchResultArrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><title>ionicons-v5-a</title><polyline points="262.62 336 342 256 262.62 176" style="fill:none;stroke:#3880ff;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="330.97" y1="256" x2="170" y2="256" style="fill:none;stroke:#3880ff;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M256,448c106,0,192-86,192-192S362,64,256,64,64,150,64,256,150,448,256,448Z" style="fill:none;stroke:#3880ff;stroke-miterlimit:10;stroke-width:32px"/></svg>'

    searchResultItem.append(searchResultCircle);
    searchResultItem.append(searchResultName);
    searchResultItem.append(searchResultDescription);
    searchResultItem.append(searchResultArrow);

    const searchResultsContainer = document.querySelector('#searchResultsContainer');
    searchResultsContainer.append(searchResultItem);
}

export const updateCreateListButton = (listName) => {
    const createListButton = document.querySelector('#createListButton');
    createListButton.innerText = `Create "${listName}"`
}

export const createCalendarMonth = (month) => {
    const calendarMonth = document.querySelector('#calendarMonth');
    calendarMonth.innerText = `${month} ${getYear()}`;
}