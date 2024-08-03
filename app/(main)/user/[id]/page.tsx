"use client"
import { getPost } from '@/app/api/posts/getPost'
import { getUserPosts } from '@/app/api/posts/getUserPosts'
import { getSession } from '@/app/api/session/getSession'
import { getUser } from '@/app/api/users/getUser'
import { updateUser } from '@/app/api/users/updateUser'
import RelativeTimeConverter from '@/components/time-convert'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { Button } from '@/components/ui/button'
import { Canva } from '@/components/ui/canva'
import FramerCanva from '@/components/ui/FramerCanva'
import { storage } from '@/utils/appwrite'
import { setConfig } from '@/utils/userConfig'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import * as Tooltip from "@radix-ui/react-tooltip";
import { ID } from 'appwrite'
import { Image } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page() {
    const { id } = useParams()
    const [userId, setUserId] = useState<string | undefined>(undefined)
    const [user, setUser] = useState<any>(null)
    const [isSelf, setSelf] = useState<boolean>(false)
    const [posts, setPosts] = useState<any>([])
    const [hold, setHold] = useState<string>('');
    const [holdPost, setPostHold] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function truncateText(text: string, maxLength: number) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + " ...";
    }

    useEffect(() => {
        async function fetchPost() {
            if (hold) {
                const post = await getPost(hold);
                setPostHold(post!!.post);
            }
        }
        fetchPost();
    }, [hold]);

    useEffect(() => {
        if (!localStorage.getItem('page')) {
            localStorage.setItem('page', '0')
        }

        const fetchPosts = async () => {
            setIsLoading(true);
            const _ = await getSession(localStorage.getItem('session')!!)
            const user = await getUser(_.sessionInfo!!);
            const response = await getUserPosts(user.user?.$id!!);
            if (response.result === "done") {
                const postsWithLikes = response?.info?.map((post) => ({
                    ...post,
                    liked: user?.user?.liked__posts.includes(post.$id),
                }));
                setPosts(postsWithLikes);
            } else {
                console.error("Error fetching posts:", response.result);
            }
            setIsLoading(false);
        };

        fetchPosts();
    }, []);

    useEffect(() => {
        if (id) {
            setUserId(id as string)
        }
    }, [id])

    useEffect(() => {
        async function fetchUser(userId: string) {
            try {
                if (localStorage.getItem('session')) {
                    const user_ = await getSession(localStorage.getItem('session')!!)
                    if (user_.sessionInfo === id) {
                        setSelf(true)
                    } else {
                        setSelf(false)
                    }
                } else {
                    setSelf(false)
                }
                const response = await getUser(userId)
                setUser(response.user)
                const userPost = await getUserPosts(userId)
                setPosts(userPost.info)
            } catch (error) {
                console.error('Error fetching post:', error)
            }
        }

        if (userId) {
            fetchUser(userId)
        }
    }, [userId])

    if (!userId || !user || !posts) {
        return <p>Loading...</p>
    }

    const stackRetriever = (stack: string) => {
        switch (stack) {
            case "html":
                return "Vanilla"
            case "react":
                return "Reactive"
            case "nextjs":
                return "Server rendered"
        }
    }

    const updateProfile = async () => {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        // Trigger file input click
        fileInput.click();

        // Listen for file selection
        fileInput.onchange = async () => {
            if (fileInput.files && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                try {
                    // Create a new file in the Appwrite storage
                    const fileId = ID.unique(); // You can use a unique identifier or function to generate one
                    const uploadResult = await storage.createFile('669eecb1002562e827cf', fileId, file);
                    const user_ = await getSession(localStorage.getItem('session')!!)
                    const userinfo_ = await getUser(user_.sessionInfo!!)
                    // Get the file URL
                    const fileUrl = storage.getFilePreview('669eecb1002562e827cf', uploadResult.$id);

                    // Update the user profile with the new photo URL
                    const response = await updateUser({profilePhoto: fileUrl.toString(), gitHub: userinfo_?.user?.github, userId: user_.sessionInfo!!});
                    if (response.result === 'done') {
                        setUser({ ...user, pfp: fileUrl }); // Update the local user state with the new photo URL
                        window.location.reload()
                    } else {
                        console.error('Error updating profile:', response.result);
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                }
            }
        };
    };

    return (
        <div className='mt-28 flex flex-col w-full lg:flex-row lg:w-max mx-auto mb-3'>
            <div className='flex flex-col w-full lg:w-[30vw]'>
                <div className='flex-col m-3 h-max rounded-xl bg-black/10 dark:bg-white/10 p-5'>
                    <h1 className='text-4xl text-center font-extrabold mt-auto'>{user.$id}{isSelf === true ? ' (You)' : null}</h1>
                    <img src={user.pfp ? user.pfp : "/unknown.png"} className='h-36 w-36 rounded-full mx-auto mt-5'></img>
                    <div className='w-full flex -mt-7 ml-12'>
                        {
                            isSelf === true && (
                                <Button onClick={updateProfile} className='mx-auto bg-white rounded-full'><Image></Image></Button>
                            )
                        }
                    </div>
                </div>
                <div className='flex-col m-3 h-max rounded-xl bg-black/10 dark:bg-white/10 p-5'>
                    {
                        user.github !== '' ? (
                            <Link className='flex w-full' target='_blank' href={user.github !== '' ? user.github : ''}>
                                <GitHubLogoIcon className='w-7 h-7 my-auto mx-3'></GitHubLogoIcon>
                                <h2 className='my-auto text-gray-800 hover:text-gray-400 dark:hover:text-white dark:text-gray-400 transition-all cursor-pointer w-max'>{user.github}</h2>
                            </Link>
                        ) : (
                            <h2 className='text-gray-800 hover:text-gray-400 dark:hover:text-white dark:text-gray-400 transition-all'>No github found for user</h2>
                        )
                    }
                </div>
                {
                    isSelf === true && (
                        <div className='flex-col m-3 h-max rounded-xl bg-black/10 dark:bg-white/10 p-5'>
                            <h1 className='text-xl font-bold'>Settings</h1>
                            <div className='mt-2'>
                                <input
                                    defaultChecked={(JSON.parse(localStorage.getItem('settings')!!)?.config?.clickToLoad!!) ?? true}
                                    onChange={(e) => { setConfig({ clickToLoad: e.target.checked }) }}
                                    type='checkbox'
                                    className='p-1'
                                ></input>
                                <span className='p-1'>Click to load preview</span>
                            </div>
                        </div>
                    )
                }
            </div>
            <div className='flex-col m-3 lg:w-[60vw] rounded-xl bg-black/10 dark:bg-white/10 p-5'>
                {posts.length >= 1 ? (
                    <div className="flex flex-col">
                        <div className="flex gap-1 w-full sideBarOverflowX pb-3 pl-[29em] overflow-auto overflow-y-hidden justify-center items-center">
                            {posts.map((post: any) => (
                                <div
                                    onMouseEnter={() => setHold(post.$id)}
                                    className="bg-black/5 dark:bg-white/5 w-80 flex flex-col rounded-md"
                                    key={post.$id}
                                >
                                    <div className="pb-2">
                                        <div className="flex px-1 m-0 justify-between">
                                            <div onClick={() => { window.location.assign("/user/" + post.author); }} className="flex p-1 group-hover:p-1.5 transition-all">
                                                <img className="cursor-pointer h-8 w-8 rounded-full p-1" src={post?.pfp ?? "/unknown.png"} alt="User profile picture" />
                                                <h2 className="cursor-pointer hover:underline my-auto p-1">{post.author}</h2>
                                                <h2 className="text-gray-500 text-sm text-right my-auto"> · <RelativeTimeConverter isoDate={post.$createdAt} /></h2>
                                            </div>
                                        </div>
                                        <div className="p-0 m-0 group">
                                            <div onClick={() => { window.location.assign("/land/" + post.$id); }} className="px-2 cursor-pointer">
                                                <div className="relative">
                                                    <div className="flex absolute top-2 right-1.5 z-10">
                                                        <Tooltip.Provider>
                                                            <Tooltip.Root>
                                                                <Tooltip.Trigger>
                                                                    <img className="w-6 h-6 hover:w-7 hover:h-7 transition-all mr-1" src={`https://skillicons.dev/icons?i=${post.stack}`} alt={`${post.stack} icon`} />
                                                                </Tooltip.Trigger>
                                                                <Tooltip.Portal>
                                                                    <Tooltip.Content side="bottom">
                                                                        <Tooltip.Arrow className="opacity-40" />
                                                                        <span className="bg-black/40 text-white m-1 p-[0.17em] px-2 rounded-lg">{stackRetriever(post.stack)}</span>
                                                                    </Tooltip.Content>
                                                                </Tooltip.Portal>
                                                            </Tooltip.Root>
                                                        </Tooltip.Provider>
                                                    </div>
                                                    <Canva post={post}></Canva>
                                                </div>
                                                <h2 className="group-hover:mt-1 mt-[-2em] font-black transition-all mix-blend-difference text-white text-lg px-2.5 w-full overflow-hidden whitespace-nowrap group-hover:font-normal">
                                                    {truncateText(post.name, 27)}
                                                </h2>
                                            </div>
                                            <div className="h-0 group-hover:h-10 transition-all px-2 mb-1.5 group-hover:mb-[-0.6em] overflow-hidden">
                                                <h3 className="text-xs text-gray-500 px-2.5 p-0">{post.description}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <h3 className="text-center">No landing pages were found...</h3>
                )}
                {holdPost && (
                    <div className="w-full">
                        <FramerCanva bool={(JSON.parse(localStorage.getItem('settings')!!)?.config?.clickToLoad!!) ?? true} post={holdPost}></FramerCanva>
                    </div>
                )}
                {!holdPost && (
                    <div className='w-full h-[400] my-4 flex flex-col bg-black/5 rounded-lg dark:bg-[#0D0613]/30'>
                        <div className='my-auto'>
                            <h1 className="dark:mt-1.5 text-center text-2xl sm:text-3xl text-black dark:text-white shadow-white">LANDX</h1>
                            <h1 className="text-center text-xl sm:text-1xl text-black dark:text-white shadow-white">Hover on a project to preview.</h1>
                            <img src='/buffer-dark.gif' className='opacity-0 dark:opacity-100 dark:mt-5 mx-auto w-10 h-5 object-cover text-center justify-center'></img>
                            <img src='/buffer-light.gif' className='opacity-100 dark:opacity-0 mx-auto w-10 h-5 object-cover text-center justify-center'></img>
                        </div>
                    </div>
                )}
            </div>
            <BackgroundBeams className='z-[-20]'></BackgroundBeams>
        </div>
    )
}
