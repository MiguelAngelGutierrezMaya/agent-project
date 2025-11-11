export const ROUTES = {
  login: {
    main: '/login',
  },
  dashboard: {
    main: '/',
  },
  training: {
    main: '/training',
  },
  assistant: {
    main: '/assistant',
  },
  profile: {
    main: '/profile',
  },
  configure: {
    main: '/configure',
  },
  notFound: {
    main: '*',
  },
};

export const NO_BILLING_ROUTES = [ROUTES.login.main];
