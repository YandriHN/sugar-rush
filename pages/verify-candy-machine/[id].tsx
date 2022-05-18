import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Title, CheckConnectedWallet } from 'components/Layout';
import Head from 'next/head';
import { useUploadCache, useVerifyCandyMachineV2 } from 'hooks';
import { useWallet } from '@solana/wallet-adapter-react';

const VerifyCandyMachine: NextPage = () => {
  const router = useRouter();
  const account = router.query.id;
  const { cache, uploadCache } = useUploadCache();
  const { connected } = useWallet();
  const { error, isLoading, verifyCandyMachine, message, connection } =
    useVerifyCandyMachineV2(cache);
  return (
    <>
      <Head>
        <title>Verify Candy Machine</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {connected ? (
        <div className='flex justify-center items-center flex-col'>
          <Title text='Verify Candy Machine' />
          <span className='mt-8'>
            {account}{' '}
            <a
              className='text-blue-700'
              href={`https://solscan.io/account/${account}${
                connection.rpcEndpoint.includes('devnet')
                  ? '?cluster=devnet'
                  : ''
              }`}
              target="_blank" rel="noopener noreferrer"
            >
              View in Solscan
            </a>
          </span>
          <div className='mt-7 flex flex-col justify-center items-center gap-3'>
            <label htmlFor='cache'>Cache file</label>

            <input type='file' name='cache' onChange={uploadCache} />
          </div>
          <button
            className='bg-slate-500 w-fit p-4 rounded-2xl mt-6 text-white'
            onClick={() => verifyCandyMachine({ account })}
          >
            {isLoading && <span>...</span>}
            {!isLoading && !error && <span>Verify CM</span>}
            {!isLoading && error && <span>Verify CM</span>}
          </button>
          {!error && message && (
            <div className='border border-cyan-500 mx-36 mt-10 p-5 rounded-xl text-black'>
              {message}
            </div>
          )}

          {!isLoading && error && (
            <div className='border border-red-500 mx-36 mt-10 p-5 rounded-xl'>
              {error}
            </div>
          )}
        </div>
      ) : (
        <CheckConnectedWallet />
      )}
    </>
  );
};

export default VerifyCandyMachine;
