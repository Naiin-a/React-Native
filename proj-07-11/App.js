import { registerRootComponent } from 'expo';

import Login from './screens/LoginScreen/Login';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Login);
export default Login;
