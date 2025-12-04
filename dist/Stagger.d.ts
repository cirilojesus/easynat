import React from 'react';
export type StaggerRef = {
    show: () => void;
    hide: () => void;
};
export declare const Stagger: React.ForwardRefExoticComponent<Omit<any, "ref"> & React.RefAttributes<StaggerRef>>;
