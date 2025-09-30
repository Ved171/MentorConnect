import React from 'react';

const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962A3.75 3.75 0 0 1 15 9.75a3.75 3.75 0 0 1 3.75 3.75m-16.5 0a3.75 3.75 0 0 1 3.75-3.75 3.75 3.75 0 0 1 3.75 3.75m-7.5 0v-.375c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125v.375m-3.75 0a3.75 3.75 0 0 1-7.5 0v-.375c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125v.375Z" />
    </svg>
);

export default UserGroupIcon;
