import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Title, CheckConnectedWallet, Carousel, Spinner, NftDetails } from 'components/layout'
import Head from 'next/head'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { Nft } from 'lib/nft/interfaces'
import { getAllNftsByCM } from 'lib/nft/actions'

const ViewCandyMachine: NextPage = () => {
    const router = useRouter()
    const candyMachineAccount = router.query.id
    const { connected } = useWallet()
    const [nfts, setNfts] = useState<Nft[]>([])
    const [nftDetails, setNftDetails] = useState<Nft>()
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const { connection } = useConnection()

    async function getNfts() {
        if (!candyMachineAccount) return
        setIsLoading(true)
        setMessage('')
        setNfts([])
        let nfts = await getAllNftsByCM(candyMachineAccount, connection)
        if (nfts.length === 0) setMessage('Assets not found')
        setNfts(nfts)
        setIsLoading(false)
    }

    function onClickSlide(e: any) {
        const nameNft = e.target.alt
        if (nfts.length !== 0) {
            const viewNft = nfts.filter((e) => e.name === nameNft)[0]
            console.log(viewNft)

            setNftDetails(viewNft)
        } else {
            setNftDetails(undefined)
        }
    }

    function refresh() {
        setNftDetails(undefined)
    }

    useEffect(() => {
        if (connected) {
            getNfts()
        }
    }, [candyMachineAccount, connection, connected])

    return (
        <>
            <Head>
                <title>View Candy Machine Nfts</title>
                <meta name='description' content='Generated by create next app' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            {connected ? (
                <div className='flex justify-center items-center flex-col text-center'>
                    <Title text='View Candy Machine Nfts' />
                    <span className='mt-8'>
                        {candyMachineAccount}{' '}
                        <a
                            className='text-blue-700'
                            href={`https://solscan.io/account/${candyMachineAccount}${
                                connection.rpcEndpoint.includes('devnet') ? '?cluster=devnet' : ''
                            }`}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            View in Solscan
                        </a>
                    </span>
                    {isLoading ? (
                        <Spinner />
                    ) : (
                        <>
                            {message.length === 0 ? (
                                <>
                                    <Carousel
                                        carouselData={nfts.map((nft) => ({
                                            title: nft.name,
                                            image: nft.image,
                                        }))}
                                        onClick={onClickSlide}
                                        slideChange={refresh}
                                    />
                                    <span className='text-[hsl(258,52%,56%)] text-center mt-6'>
                                        Click the img to view Nft details
                                    </span>
                                </>
                            ) : (
                                <span className='mt-8'>{message}</span>
                            )}
                        </>
                    )}
                    {nftDetails && <NftDetails nft={nftDetails} />}
                </div>
            ) : (
                <CheckConnectedWallet />
            )}
        </>
    )
}

export default ViewCandyMachine
