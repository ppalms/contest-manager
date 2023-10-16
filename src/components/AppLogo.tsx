import * as React from 'react';
const AppLogo = (props: any) => (
  <>
    <svg
      fill="#000000"
      width="50px"
      height="50px"
      viewBox="0 0 24 24"
      id="music"
      data-name="Flat Line"
      xmlns="http://www.w3.org/2000/svg"
      className="icon flat-line"
      {...props}>
      <path
        id="secondary"
        d="M12,3a9,9,0,1,0,9,9A9,9,0,0,0,12,3Z"
        style={{
          fill: 'rgb(44, 169, 188)',
        }}
      />
      <path
        id="primary"
        d="M15,8H12v6"
        style={{
          fill: 'none',
          stroke: 'rgb(0, 0, 0)',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
        }}
      />
      <circle
        id="note-flag-fill"
        cx="10"
        cy="14"
        r="2"
        style={{
          fill: 'white',
          stroke: 'none',
        }}
      />
      <path
        id="primary-2"
        data-name="primary"
        d="M12,14a2,2,0,1,1-2-2A2,2,0,0,1,12,14ZM12,3a9,9,0,1,0,9,9A9,9,0,0,0,12,3Z"
        style={{
          fill: 'none',
          stroke: 'rgb(0, 0, 0)',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
        }}
      />
    </svg>
    <span className="pl-1">
      <h1 className="text-lg font-semibold leading-6 text-gray-100">
        Contest Manager
      </h1>
    </span>
  </>
);
export default AppLogo;
