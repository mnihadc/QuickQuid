import * as api from '../api';

export const signin = (formData, navigate) => async (dispatch) => {
  try {
    // 1. Send data to backend
    const { data } = await api.signIn(formData);

    // 2. If successful, dispatch 'AUTH' to the reducer
    dispatch({ type: 'AUTH', data });

    // 3. Redirect user to home page
    navigate('/'); 
  } catch (error) {
    console.log(error);
    alert("Login Failed! Check console.");
  }
};

export const signup = (formData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.signUp(formData);

    dispatch({ type: 'AUTH', data });

    navigate('/');
  } catch (error) {
    console.log(error);
    alert("Signup Failed! Check console.");
  }
};