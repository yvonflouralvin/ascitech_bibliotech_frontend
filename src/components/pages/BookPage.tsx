'use client'
import React, { useEffect, useState } from 'react'
import BackButton from '../widgets/BackButton'
import { Book, BookPage } from '@/lib/hooks/useBook/type'
import { Button, Spinner } from '@nextui-org/react'
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies'
import { useRouter } from 'next/navigation'
import useConfig from '@/lib/hooks/useConfig'
import useBook from '@/lib/hooks/useBook'
import useBookPage from '@/lib/hooks/useBookPage'
import { ArrowLeft, CornerUpLeftIcon, DownloadIcon, HeartIcon, HeartOff } from 'lucide-react'
import useFavori from '@/lib/hooks/useFavori'

interface BookPageProps {
    book?: Book
    onClose: () => any
    dbBookPage: IDBDatabase | undefined
    getPage: (bookId: string, pageId: number) => Promise<BookPage | undefined>
    countDownloadedPages: (id: string) => Promise<number>
}
export default function BookPageLayout(props: BookPageProps) {

    const [book, setBook] = useState<Book | undefined>(props.book);
    useEffect(() => {
        setBook(book)
    }, [book])

    const [cover, setCover] = useState<string>('https://via.placeholder.com/200x200');
    const [downloadedPages, setDownloadedPages] = useState<number | undefined>(undefined);
    const [isFavotite, setIsFavorite] = useState<boolean | undefined>(undefined);

    // const {
    //     get: getConfig,
    //     put: putConfig,
    //     db,
    // } = useConfig();

    const {
        //getPage,
        //db: dbBook,
        //countDownloadedPages
    } = useBookPage();

    // const {
    //     getBook
    // } = useBook(false);

    const {
        addToFavorite,
        dbFavorite,
        getFavorites,
        removeToFavorite
    } = useFavori();

    useEffect(() => {
        if (dbFavorite !== undefined && book !== undefined) {
            const exec = async () => {
                const favs = await getFavorites();
                const fav = favs.find(f => f.id === book?.id);
                if (fav) setIsFavorite(true);
                else setIsFavorite(false);
            }
            exec();
        }
    }, [dbFavorite, book])

    const handleLoadCover = async () => {
        if (book === undefined) return;
        try {
            const page: BookPage | undefined = await props.getPage(book.id, 1);
            if (page === undefined) return;
            setCover(`data:image/jpg;base64,${page.content}`);
        } catch (e) {
            console.error(e);
            setCover('https://via.placeholder.com/200x200'); // default cover image
        }
    }

    // const loadingBook = async () => {
    //     try {
    //         const bookId = localStorage.getItem("book-to-show")
    //         if (bookId === undefined || bookId === null) {
    //             console.log("Book not found");
    //             return;
    //         };

    //         const _book: Book | undefined = await getBook(bookId);
    //         setBook(_book);
    //     } catch (e) {

    //     }
    // }
    // useEffect(() => {
    //     if (db) loadingBook();
    // }, [db])

    useEffect(() => {
        if (book !== undefined) {
            handleLoadCover();
            const exec = async () => setDownloadedPages(await props.countDownloadedPages(book.id));
            exec();
        }
    }, [book]);

    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const handleReadBook = () => {
        //router.push(`/book/${props.bookId}/read/1/`);
        setIsOpen(true);
    }
    const [isDownloadingPages, setIsDownloadingPages] = useState<boolean>(false);
    const handleDownloadBook = async () => {
        if (book === undefined) return;
        var downloadingCounting = 0;
        setIsDownloadingPages(true);
        const spanElement: any = document.getElementById("downloadedPercent");
        for (let i = 0; i < book?.page; i++) {
            await props.getPage(book?.id, i);
            downloadingCounting = (downloadingCounting + 1);
            //spanElement?.textContent = `${parseInt(`${downloadingCounting}`)}%`;
        }
        setDownloadedPages(await props.countDownloadedPages(book.id));
        setIsDownloadingPages(false);
    }
    return <>
        {
            isOpen === false && <div className='flex flex-col  h-full w-full'>
                <div className='flex items-center gap-[10px] p-[20px]'>
                    <ArrowLeft onClick={props.onClose} size={20} className="cursor-pointer" />
                    <p className='text-[14px]'>Détail du livre</p>
                </div>
                {
                    book === undefined ? <div className='flex items-center gap-[20px] px-[20px]'>
                        <Spinner size='md' />
                        <p>Chargement des informations du livre en cours...</p>
                    </div> : <div className='flex flex-col flex-1 overflow-y-scroll'>
                        <div className='w-full flex items-center flex-col sm:flex-row px-[50px]'>
                            <img src={`${cover}`} className='object-cover w-[200px] h-[250px]' />
                            <div className='w-full p-[10px] px-[0px] sm:px-[30px]'>
                                <p className='text-[20px] font-bold'>{book.title}</p>
                                <p>{book.description}</p>
                                <p className='text-[14px]'>{book.page} Pages</p>
                                {downloadedPages && <p className='text-[14px]'>{downloadedPages} Page{downloadedPages > 1 ? "s" : ""} téléchargée{downloadedPages > 1 ? "s" : ""}</p>}
                                {
                                    isDownloadingPages === false && <>
                                        {
                                            book !== undefined && <div className='flex gap-[10px] items-end'>
                                                <Button className='bg-primary text-white  mt-[20px]' onClick={handleReadBook}>Lire le livre</Button>
                                                {
                                                    downloadedPages !== book.page && <Button onClick={handleDownloadBook}> <DownloadIcon size={14} /> Télécharger le livre</Button>
                                                }

                                                {
                                                    (dbFavorite !== undefined && isFavotite !== undefined) &&
                                                    <div className='flex items-center justify-center h-[40px] w-[40px] p-[10px] rounded-xl cursor-pointer bg-[rgba(0,0,0,0.07)]'
                                                        onClick={() => {
                                                            const exec = async () => {
                                                                try {
                                                                    if (isFavotite === false) {
                                                                        await addToFavorite(book);
                                                                        setIsFavorite(true);
                                                                    } else {
                                                                        await removeToFavorite(book.id);
                                                                        setIsFavorite(false);
                                                                    }
                                                                } catch (e) {

                                                                }
                                                            }
                                                            exec()
                                                        }}
                                                    >
                                                        {isFavotite === true && <HeartOff size={18} />}
                                                        {isFavotite === false && <HeartIcon size={18} color='red' />}
                                                    </div>
                                                }
                                            </div>
                                        }
                                    </>
                                }

                                {
                                    isDownloadingPages === true && <div className='flex items-center gap-[10px]'>
                                        <Spinner />
                                        <p>Téléchargement en cours... <span id="downloadedPercent"></span> </p>
                                    </div>
                                }

                            </div>
                        </div>
                    </div>
                }
            </div>
        }
        {
            (isOpen && book) && <div className='w-full bg-white opacity-1 z-50 overflow-y-scroll'>
                <div className='flex items-center justify-center w-full pb-[40px]'>
                    <BookShow book={book} close={() => setIsOpen(false)} db={props.dbBookPage} getPage={props.getPage} />
                </div>
            </div>
        }
    </>
}

interface BookShowProps {
    book: Book,
    close: () => void
    db: IDBDatabase | undefined
    getPage: (bookId: string, page: number) => Promise<BookPage | undefined>
}
const BookShow = (props: BookShowProps) => {
    const [currentPage, setCurrentPage] = useState<number>(1);

    return <div className='w-full'>
        <div className='flex items-center w-full'>
            <div className='p-[10px] text-[12px] flex items-center gap-[10px]'>
                {
                    currentPage > 1 && <Button onClick={() => setCurrentPage(currentPage - 1)}>Précédent</Button>
                }
                <p>{currentPage} sur {props.book.page}</p>
                {
                    currentPage < (props.book.page) && <Button onClick={() => setCurrentPage(currentPage + 1)}>Suivant</Button>
                }

            </div>
            <div className='flex-1 flex items-center justify-end'>
                <Button type='reset' onClick={props.close}>Fermer</Button>
            </div>
        </div>
        <BookShowPage pageNumber={currentPage} book={props.book} db={props.db} getPage={props.getPage} />

    </div>
}
interface BookShowPageProps {
    book: Book,
    pageNumber: number
    db: IDBDatabase | undefined
    getPage: (bookId: string, page: number) => Promise<BookPage | undefined>
}
const BookShowPage = (props: BookShowPageProps) => {

    const [cover, setCover] = useState<string | undefined>(undefined);
    const [isOpenning, setIsOpenning] = useState<boolean>(false);
    const loadPage = async () => {
        try {
            setIsOpenning(true);
            const page: BookPage | undefined = await props.getPage(props.book.id, props.pageNumber);
            if (page !== undefined) {
                setCover(`data:image/jpg;base64,${page.content}`);
            }
            setIsOpenning(false)
        } catch (e) {

        }
    }
    useEffect(() => {
        if (props.db) loadPage();
    }, [props.db, props.pageNumber])
    return <>
        <div className='w-full flex flex-col items-center justify-center w-full'>
            {
                isOpenning === true ? <div className='flex flex-col items-center justify-center w-full h-full'>
                    <Spinner size='md' />
                    <p>Chargement de la page en cours...</p>
                </div> : <>
                    {
                        cover !== undefined ? <>
                            <img src={`${cover}`} className='object-cover md:w-full lg:w-[700px]' />

                        </> : <div className='flex flex-col items-center justify-center w-full h-full'>
                            <Spinner size='md' />
                            <p>Chargement de la page en cours...</p>
                        </div>
                    }
                </>
            }
        </div>

    </>
}