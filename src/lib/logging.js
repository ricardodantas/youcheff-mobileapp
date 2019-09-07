import { Client } from 'bugsnag-react-native';
import settings from '../config/settings';

const bugsnag = new Client(settings.BUGSNAG_API_KEY);

const log = ({ user = null, entry }) => {
  if (user) {
    bugsnag.setUser(user.uid, user.email, user.email);
  }
  bugsnag.notify(entry);
};

export default log;
