import sanitize from 'sanitize-html';
import * as yup from 'yup';
import db from '../index.js';

const routes = {
  mainPagePath: () => '/',
  coursesPath: () => '/courses',
  newCoursePath: () => '/courses/new',
  coursePath: (id) => `/courses/${id}`,
};

export default (app) => {
  
  // Просмотр списка курсов
  app.get(routes.coursesPath(), (req, res) => {
    const { term } = req.query;

    db.all('SELECT * FROM courses', (error, data) => {
      const templateData = {
        term,
        header: 'Курсы по программированию',
        messages: res.flash('success'),
        routes,
        error,
      };

      if (term) {
        templateData.courses = data.filter((course) => course.id === parseInt(term) 
          || course.description.toLowerCase().includes(term.toLowerCase()));
      } else {
        templateData.courses = data;
      }
      res.view('src/views/courses/index', templateData);
    });
  });


  // Форма создания нового курса
  app.get(routes.newCoursePath(), (req, res) => {
    const data = {
      header: 'Добавить новый курс',
      routes,
    }
    res.view('src/views/courses/new', data);
  });


  // Просмотр конкретного курса
  app.get(routes.coursePath(':id'), (req, res) => {
    const { id } = req.params;

    db.all('SELECT * FROM courses', (error, data) => {
      const course = data.find(({ id: courseId }) => courseId === parseInt(id));
      if (!course) {
        res.code(404).send({ message: 'Course not found' });
        return;
      }
      const templateData = {
        course,
        routes,
        error
      };
      res.view('src/views/courses/show', templateData)
    });
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
      req.flash('error', { type: 'info', message: 'Ошибка создания нового курса' });
      
      const data = {
        id, title, description,
        header: 'Добавить новый курс',
        messages: res.flash('error'),
        error: req.validationError,
        routes,
      };

      res.view('src/views/courses/new', data);
      return;
    }

    const course = {
      id: parseInt(id),
      title: title.trim(),
      description: description.trim(),
      routes,
    };

    const stmt = db.prepare('INSERT INTO courses VALUES (?, ?, ?)');

    stmt.run([course.id, course.title, course.description], function (error) {
      if (error) {
        req.flash('error', { type: 'info', message: 'Ошибка записи нового курса' });
        const templateData = {
          id: course.id,
          title: course.title,
          description: course.title,
          header: 'Добавить новый курс',
          messages: res.flash('error'),
          error,
          routes,
        };
        res.view('src/views/courses/new', templateData);
        return;
      }
      req.flash('success', { type: 'success', message: 'Новый курс создан' });
      res.redirect(routes.coursesPath());
    });
  });
};