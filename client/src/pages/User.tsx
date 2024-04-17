// import React from "react";
import LogoutButton from '../components/LogOut'
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const User = () => {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                //const jwtToken :string = import.meta.env.JWT_TOKEN
                const response = await axios.get('http://localhost:3000/api/get-user-name', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });
                setUserName(response.data.name);
                console.log(response)
            } catch (error) {
                console.error('Failed to fetch user name:', error);
                // Handle errors, e.g., by redirecting to login if unauthorized
            }
        };

        fetchUserName();
    }, []);

    return (
        <div>
            {userName ? <h1>Hello, {userName}</h1> : <h1>Welcome!</h1>}
            <LogoutButton />
        </div>
    );
};

export default User;