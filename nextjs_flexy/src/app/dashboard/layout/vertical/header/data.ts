interface appLinkType {
  href: string;
  title: string;
  subtext: string;
  avatar: string;
}

interface pageLinksType {
  href: string;
  title: string;
}

const appsLink: appLinkType[] = [
  {
    href: '/apps/chats',
    title: 'Chat Application',
    subtext: 'Messages & Emails',
    avatar: '/images/svgs/icon-dd-chat.svg',
  },
  {
    href: '/apps/ecommerce/shop',
    title: 'eCommerce App',
    subtext: 'Messages & Emails',
    avatar: '/images/svgs/icon-dd-cart.svg',
  },
  {
    href: '/apps/invoice/list',
    title: 'Invoice App',
    subtext: 'Messages & Emails',
    avatar: '/images/svgs/icon-dd-invoice.svg',
  },
  {
    href: '/apps/calendar',
    title: 'Calendar App',
    subtext: 'Messages & Emails',
    avatar: '/images/svgs/icon-dd-date.svg',
  },
  {
    href: '/apps/contacts',
    title: 'Contact Application',
    subtext: 'Account settings',
    avatar: '/images/svgs/icon-dd-mobile.svg',
  },
  {
    href: '/apps/tickets',
    title: 'Tickets App',
    subtext: 'Account settings',
    avatar: '/images/svgs/icon-dd-lifebuoy.svg',
  },
  {
    href: '/apps/email',
    title: 'Email App',
    subtext: 'To-do and Daily tasks',
    avatar: '/images/svgs/icon-dd-message-box.svg',
  },
  {
    href: '/dashboards/dashboard2',
    title: 'Ecom Dashboard ',
    subtext: 'Data-genic Dashbaords',
    avatar: '/images/svgs/icon-dd-application.svg',
  },
];

const pageLinks: pageLinksType[] = [
  {
    href: '/theme-pages/pricing',
    title: 'Pricing Page',
  },
  {
    href: '/auth/auth1/login',
    title: 'Authentication Design',
  },
  {
    href: '/auth/auth1/register',
    title: 'Register Now',
  },
  {
    href: '/auth/error',
    title: '404 Error Page',
  },
  {
    href: '/apps/notes',
    title: 'Notes App',
  },
  {
    href: '/apps/user-profile/profile',
    title: 'User Application',
  },
  {
    href: '/apps/blog/post',
    title: 'Blog Design',
  },
  {
    href: '/apps/ecommerce/checkout',
    title: 'Shopping Cart',
  },
];

// Notifications dropdown

interface notificationType {
  avatar: string;
  title: string;
  subtitle: string;
}

interface msgType {
  avatar: string;
  title: string;
  subtitle: string;
  time: string;
  status: string;
}

const messages: msgType[] = [
  {
    avatar: '/images/users/1.jpg',
    title: 'Roman Joined the Team!',
    subtitle: 'Congratulate him',
    time: '9:08 AM',
    status: 'success.main',
  },
  {
    avatar: '/images/users/2.jpg',
    title: 'New message received',
    subtitle: 'Salma sent you new message',
    time: '11:56 AM',
    status: 'warning.main',
  },
  {
    avatar: '/images/users/3.jpg',
    title: 'New Payment received',
    subtitle: 'Check your earnings',
    time: '4:39 AM',
    status: 'success.main',
  },
  {
    avatar: '/images/users/4.jpg',
    title: 'Jolly completed tasks',
    subtitle: 'Assign her new tasks',
    time: '1:12 AM',
    status: 'error.main',
  },
];

const notifications: notificationType[] = [
  {
    avatar: '/images/users/1.jpg',
    title: 'Roman Joined the Team!',
    subtitle: 'Congratulate him',
  },
  {
    avatar: '/images/users/2.jpg',
    title: 'New message received',
    subtitle: 'Salma sent you new message',
  },
  {
    avatar: '/images/users/3.jpg',
    title: 'New Payment received',
    subtitle: 'Check your earnings',
  },
  {
    avatar: '/images/users/4.jpg',
    title: 'Jolly completed tasks',
    subtitle: 'Assign her new tasks',
  },
  {
    avatar: '/images/users/1.jpg',
    title: 'Roman Joined the Team!',
    subtitle: 'Congratulate him',
  },
  {
    avatar: '/images/users/2.jpg',
    title: 'New message received',
    subtitle: 'Salma sent you new message',
  },
  {
    avatar: '/images/users/3.jpg',
    title: 'New Payment received',
    subtitle: 'Check your earnings',
  },
  {
    avatar: '/images/users/4.jpg',
    title: 'Jolly completed tasks',
    subtitle: 'Assign her new tasks',
  },
];

export { notifications, messages, appsLink, pageLinks };
