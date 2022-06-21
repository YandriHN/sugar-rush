import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Program, AnchorProvider, BN } from '@project-serum/anchor'
import { PublicKey, Connection } from '@solana/web3.js'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { Spinner, Title, UpdateCreateCandyMachineForm } from 'components'
import { FetchedCandyMachineConfig } from 'lib/interfaces'
import { CANDY_MACHINE_PROGRAM_V2_ID } from 'lib/constants'
import Head from 'next/head'
import { Account } from 'lib/types'

const CandyMachine: NextPage = () => {
    const router = useRouter()
    const account = router.query.id

    const anchorWallet = useAnchorWallet()
    const { connection } = useConnection()
    const [candyMachineConfig, setCandyMachineConfig] = useState<FetchedCandyMachineConfig>()
    const [error, setError] = useState('')

    const [isLoading, setIsLoading] = useState(false)

    async function fetchCandyMachine({
        account,
        connection,
    }: {
        account: Account
        connection: Connection
    }): Promise<FetchedCandyMachineConfig | undefined> {
        if (account && anchorWallet) {
            try {
                setIsLoading(true)
                const provider = new AnchorProvider(connection, anchorWallet, {
                    preflightCommitment: 'processed',
                })

                const idl = await Program.fetchIdl(CANDY_MACHINE_PROGRAM_V2_ID, provider)

                const program = new Program(idl!, CANDY_MACHINE_PROGRAM_V2_ID, provider)

                const state: any = await program.account.candyMachine.fetch(new PublicKey(account))

                state.data.solTreasuryAccount = state.wallet
                state.data.itemsRedeemed = state.itemsRedeemed
                console.log('candyMachineConfig: ', state)
                setIsLoading(false)

                return state.data
            } catch (err) {
                console.error(err)
                setIsLoading(false)
                setError((err as Error).message)
            }
        }
    }

    useEffect(() => {
        fetchCandyMachine({ account, connection }).then(setCandyMachineConfig)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account, connection, anchorWallet])

    return (
        <>
            <Head>
                <title>Update Candy Machine</title>
                <meta name='description' content='Generated by create next app' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <div className='container flex justify-center items-center flex-col'>
                <Title text='Update Candy Machine' />
                <div className='mt-8 flex flex-col text-center'>
                    <span className='break-all border border-slate-300 shadow-xl py-2 px-4 rounded-lg text-center'>
                        {account}{' '}
                    </span>

                    <a
                        className='text-blue-regular mt-4'
                        href={`https://solscan.io/account/${account}?cluster=devnet`}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        View in Solscan
                    </a>
                </div>
                {isLoading && <Spinner />}
                {error && (
                    <div className='flex flex-col items-center justify-center mt-11'>
                        Error fetching candy machine config
                        <button
                            className='rounded-lg bg-slate-400 p-2 mt-4'
                            onClick={() => fetchCandyMachine({ account, connection })}
                        >
                            Fetch again
                        </button>
                    </div>
                )}

                {!error && candyMachineConfig?.uuid && (
                    <div className='mt-5 flex flex-col text-center'>
                        <span className=''>
                            There are {new BN(candyMachineConfig.itemsAvailable).toNumber()} unminted NFT.
                        </span>
                        <span className='mt-2'>
                            {new BN(candyMachineConfig.itemsRedeemed).toNumber()} redeemed NFT.
                        </span>
                        <UpdateCreateCandyMachineForm
                            fetchedValues={candyMachineConfig}
                            updateCandyMachine
                            candyMachinePubkey={account}
                        />
                    </div>
                )}
            </div>
        </>
    )
}

export default CandyMachine
