import { Button } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div>
      <h1>Not Found</h1>
      <Link to={'/'}>
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}

export default NotFound;
