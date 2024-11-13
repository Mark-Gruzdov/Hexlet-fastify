import sanitize from 'sanitize-html';
import * as yup from 'yup';

const routes = {
  mainPagePath: () => '/',
  coursesPath: () => '/courses',
  newCoursePath: () => '/courses/new',
  coursePath: (id) => `/courses/${id}`,
};
const state = {
  courses: [
    {
      id: 1,
      title: 'JS: Массивы',
      description: 'Курс про массивы в JavaScript',
    },
    {
      id: 2,
      title: 'JS: Функции',
      description: 'Курс про функции в JavaScript',
    },
    {
      id: 3,
      title: 'JS: Объекты',
      description: 'Курс про объекты в JavaScript',
    },
  ],
};

export default (app) => {
  
  // Просмотр списка курсов
  app.get(routes.coursesPath(), (req, res) => {
    const { term } = req.query;
    const data = {
      term,
      header: 'Курсы по программированию',
      routes,
    };

    if (term) {
      data.courses = state.courses.filter((course) => course.id === parseInt(term) 
        || course.description.toLowerCase().includes(term.toLowerCase()));
    } else {
      data.courses = state.courses;
    }
    res.view('views/courses/index', data);
  });


  // Форма создания нового курса
  app.get(routes.newCoursePath(), (req, res) => {
    const data = {
      header: 'Добавить новый курс',
      routes,
    }
    res.view('views/courses/new', data);
  });


  // Просмотр конкретного курса
  app.get(routes.coursePath(':id'), (req, res) => {
    const { id } = req.params;
    const course = state.courses.find(({ id: courseId }) => courseId === parseInt(id));
    if (!course) {
      res.code(404).send({ message: 'Course not found' });
      return;
    }
    const data = {
      course,
      routes,
    };
    res.view('views/courses/show', data);
  });


  // Просмотр конкретного урока в курсе
  app.get('/courses/:courseId/lessons/:id', (req, res) => {
    const sanitizeCourse = sanitize(req.params.courseId);
    const sanitizeLesson = sanitize(req.params.id);
    res.send(`Course ID: ${sanitizeCourse}; Lesson ID: ${sanitizeLesson}`);
  });


  // Создание нового курса
  app.post(routes.coursesPath(), {
    attachValidation: true,
    schema: {
      body: yup.object({
        id: yup.number().integer(),
        title: yup.string().min(2, 'Заголовок должен быть не менее 2 символов'),
        description: yup.string().min(10, 'Описание должно быть не менее 10 символов'),
      }),
    },
    validatorCompiler: ({ schema, method, url, httpPart }) => (data) => {
      try {
        const result = schema.validateSync(data);
        return { value: result };
      } catch (e) {
        return { error: e };
      }
    },
  },(req, res) => {
    const { id, title, description } = req.body;

    if (req.validationError) {
      const data = {
        id, title, description,
        header: 'Добавить новый курс',
        error: req.validationError,
        routes,
      };

      res.view('views/courses/new', data);
      return;
    }

    const course = {
      id: parseInt(id),
      title: title.trim(),
      description: description.trim(),
      routes,
    };

    state.courses.push(course);

    res.redirect(routes.coursesPath());
  });
};