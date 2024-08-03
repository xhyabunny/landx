"use client"
import React, { useEffect, useRef, useState } from 'react';
import sdk, { VM } from '@stackblitz/sdk';
import { BackgroundBeams } from './background-beams';
import { Button } from './button';
import { ArrowLeft, Download, LoaderIcon, RefreshCcw, Trash } from 'lucide-react';
import Link from 'next/link';
import { getPost } from '@/app/api/posts/getPost';
import { getUser } from '@/app/api/users/getUser';
import { LikeHandlerPage } from './LikeHandlerPage';
import JSZip, { files } from 'jszip';
import { saveAs } from 'file-saver';
import { getSession } from '@/app/api/session/getSession';
import { deletePost } from '@/app/api/posts/deletePost';
import { updatePost } from '@/app/api/posts/updatePost';

interface Post {
    $id: string;
    name: string;
    description: string;
    stack: string;
    data: any;
    author: string;
    liked: boolean;
    likes: number;
}

const Framer = ({ post }: { post: Post }) => {
    const savedSettings = localStorage.getItem('settings');
    const parsedSettings = savedSettings ? JSON.parse(savedSettings) : {};
    const [error, setError] = useState<string | null>(null);
    const [postState, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSelf, setSelf] = useState(false);
    const vmRef = useRef<VM | null>(null); // Usar useRef para mantener la referencia a VM

    const createDynamicZipFile = async (post: any) => {
        if (!vmRef.current) {
            console.error("VM is not initialized.");
            setError('Failed to download project. VM not initialized.');
            return;
        }

        setIsLoading(true);

        try {
            const files_:any = await vmRef.current.getFsSnapshot();

            const zip = new JSZip();
            for (const [fileName, fileContent] of Object.entries(files_)) {
                zip.file(fileName, fileContent as string | Blob | Uint8Array | ArrayBuffer);
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, post.name.toLowerCase().split(' ').join('-') + '-by-' + post.author + '.zip');
        } catch (err) {
            console.error("Failed to create ZIP file:", err);
            setError('Failed to create ZIP file. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (post) {
            embedProject();
        }

        const userChecker = async () => {
            const session = await getSession(localStorage.getItem('session')!!)
            const user = await getUser(session.sessionInfo!!);
            if(user.user?.$id === post.author) {
                setSelf(true)
            } else {
                setSelf(false)
            }
        }

        userChecker()
    }, [post]);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!post) return;

            const response = await getPost(post.$id);
            const session = await getSession(localStorage.getItem('session')!!)
            const user = await getUser(session.sessionInfo!!);

            if (response.result === "done") {
                const updatedPost = {
                    ...post,
                    liked: user?.user?.liked__posts.includes(post.$id) || false
                };
                setPost(updatedPost);
            } else {
                console.error("Error fetching posts:", response.result);
            }
        };

        fetchPosts();
    }, [post]);

    const handleDownload = () => {
        createDynamicZipFile(post);
    };

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            const session = await getSession(localStorage.getItem('session')!!)
            const user = await getUser(session.sessionInfo!!);
            let _ = await deletePost(post.$id, user.user?.$id!!)
            if(_.result === 'done') {
                window.location.assign('/user/'+user.user?.$id)
                setIsLoading(false)
            } else {
                setIsLoading(false)
            }
        } catch (error) {
            setIsLoading(false)
        }
    }

    const handleUpdate = async () => {
        if (!vmRef.current) {
            console.error("VM is not initialized.");
            setError('Failed to download project. VM not initialized.');
            return;
        }
        setIsLoading(true);
        
        try {
            const files_ = await vmRef.current.getFsSnapshot();
            if(post.data === JSON.stringify(files_)) return setIsLoading(false);
            const session = await getSession(localStorage.getItem('session')!!)
            const user = await getUser(session.sessionInfo!!);
            let _ = await updatePost({
                data: JSON.stringify(files_),
                postId: post.$id,
                userId: user.user?.$id!!
            })
            if(_.result === 'done') {
                window.location.reload()
                setIsLoading(false)
            } else {
                setIsLoading(false)
            }
        } catch (error) {
            setIsLoading(false)
        }
    }

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
        if (!post) return;

        let json;

        try {
            json = JSON.parse(post.data);
            setError(null); // Reset any previous error
        } catch (parseError) {
            setError('Failed to parse JSON. Unable to load the project.');
            return; // Exit the function if JSON parsing fails
        }

        try {
            vmRef.current = await sdk.embedProject(
                'embed' + post.name.toLowerCase().split(' ').join('-'),
                {
                    title: post.name,
                    description: post.description,
                    template: retrieveTemplate(post.stack),
                    files: json,
                },
                {
                    clickToLoad: JSON.parse(localStorage.getItem('settings')!!)?.config?.clickToLoad!! ?? true,
                    terminalHeight: 50,
                    hideNavigation: true,
                    height: 500,
                    width: 'auto',
                    theme: localStorage.getItem('theme') === 'dark' || localStorage.getItem('theme') === 'system' ? 'dark' : 'light'
                },
            );
        } catch (embedError) {
            console.error("Failed to embed project:", embedError);
            setError('Failed to embed project. Please try again later.');
        }
    };

    return (
        <div>
            <div className='flex mx-auto mb-2 w-fit'>
                <Link href='/dashboard'>
                    <Button className='flex m-1' variant={'outline'}>
                        <ArrowLeft className='h-5.5 w-5.5' />
                    </Button>
                </Link>
                <Button disabled={isLoading} className='flex m-1' onClick={handleDownload} variant={'outline'}>
                    {isLoading ? (<LoaderIcon className='animate-spin h-5 w-5' />) : (<Download className='h-5 w-5' />)}
                </Button>
                {postState && (
                    <LikeHandlerPage setPost={setPost} post={postState} />
                )}
                {
                    isSelf === true && (
                        <>
                        <Button disabled={isLoading} className='flex m-1' onClick={handleDelete} variant={'outline'}>
                            {isLoading ? (<LoaderIcon className='animate-spin h-5 w-5' />) : (<Trash className='h-5 w-5' />)}
                        </Button>
                        <Button disabled={isLoading} className='flex m-1' onClick={handleUpdate} variant={'outline'}>
                            {isLoading ? (<LoaderIcon className='animate-spin h-5 w-5' />) : (<RefreshCcw className='h-5 w-5' />)}
                        </Button>
                        </>
                    )
                }
            </div>
            <div className='w-[80%] mx-auto rounded-lg overflow-hidden my-4' id={'embed' + (post?.name.toLowerCase().split(' ').join('-') || '')}></div>
            <BackgroundBeams className='z-[-20]' />
        </div>
    );
};

export default Framer;
