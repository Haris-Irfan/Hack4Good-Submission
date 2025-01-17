export const createNewUser = async (user_email: string, password: string) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createUser',
          user_email,
          password,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        return
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
};

export const updateUserPassword = async (user_email: string, password: string) => {
  const response = await fetch('/api/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'updatePassword',
      user_email,
      password,
    }),
  });

  const data = await response.json();
  if (response.ok) {
    return response
  } else {
    throw new Error('Failed to update password');
  }
};

export const suspendUser = async (user_email: string) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'suspendUser',
          user_email,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        return
      } else {
        throw new Error('Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
    }
};

export const reenableUser = async (user_email: string) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reenableUser',
          user_email,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        return
      } else {
        throw new Error('Failed to re-enable user');
      }
    } catch (error) {
      console.error('Error re-enabling user:', error);
    }
};

export const isUserSuspended = async (user_email : string) => {
    try {
        const response = await fetch('/api/admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'isUserSuspended',
            user_email,
          }),
        });
    
        const data = await response.json();
        if (response.ok) {
          return data.message
        } else {
          throw new Error('Failed to retrieve user status');
        }
      } catch (error) {
        console.error('Error retrieving user status:', error);
      }
}