"use client";
import React, { useEffect, useState } from 'react';
import sdk from '@stackblitz/sdk';

const FramerCanva = ({ post, bool }: { post: any, bool: boolean }) => {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setError(null);
        embedProject();
    }, [post]);

    const retrieveTemplate = (stack: string) => {
        switch (stack) {
            case "Vanilla":
                return "node";
            case "React":
                return "create-react-app";
            default:
                return "node";
        }
    };

    const embedProject = async () => {
        let json;

        try {
            json = JSON.parse(post.data);
            setError(null); // Reset any previous error
        } catch (parseError) {
            setError('Failed to parse JSON. Unable to load the project.');
            return; // Exit the function if JSON parsing fails
        }

        try {
            // Embed the project
            sdk.embedProject(
                'embed',
                {
                    title: post.name,
                    description: post.description,
                    template: retrieveTemplate(post.stack),
                    files: json,
                },
                {
                    view: 'preview',
                    hideExplorer: true,
                    hideDevTools: true,
                    showSidebar: false,
                    hideNavigation: true,
                    clickToLoad: JSON.parse(localStorage.getItem('settings')!!)?.config?.clickToLoad!! ?? true,
                    height: 400,
                    width: 'auto',
                    theme: localStorage.getItem('theme') === 'dark' || localStorage.getItem('theme') === 'system' ? 'dark' : 'light',
                }
            );
        } catch (embedError) {
            setError('Failed to embed project. Please try again later.');
        }
    };

    return (
        <div className='w-full'>
            <div id="embed" className="mx-auto w-[100%] m-4 rounded-md overflow-hidden"></div>
        </div>
    );
};

export default FramerCanva;
