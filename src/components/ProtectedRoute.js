// import React from "react";
// import { Route, Redirect } from "react-router-dom";
// import { auth } from "../config/Firebase";

// const ProtectedRoute = ({ component: Component, ...rest }) => {
//   return (
//     <Route
//       {...rest}
//       render={(props) => {
//         return auth.currentUser ? (
//           <Component {...props} />
//         ) : (
//           <Redirect to="/" />
//         );
//       }}
//     />
//   );
// };

// export default ProtectedRoute;
