import { benchmarks, addLiquidityEthBytesRevert, addLiquidityEthBytes, signer, approveAndFund, getReserves, quotePrice, swapETHForExactTokensBytes, swapExactETHForTokensBytes, etherVal } from './app'

import {  contractAddresses } from "@uniswap/sdk";
import { utils } from "ethers";


const between = (min: utils.BigNumber, target: utils.BigNumber, max: utils.BigNumber)=>{
  return min.lt(target) && target.lte(max)
}

var assert = require('assert');
  describe('addLiquidityEth tests', function() {
    let count = 3
    it(`handles ${count} addLiquiditiyETH calls`, async function() {
        const [oldtestTokenReserves,  oldEthReserves] = await  getReserves (contractAddresses.testTokenAddress, contractAddresses.wethAddress)
        const oldTestTokenPrice = await quotePrice( etherVal, contractAddresses.testTokenAddress, contractAddresses.wethAddress)

        const oldBal = await signer.getBalance()

        return benchmarks.run([{
          method: addLiquidityEthBytes,
          count,
          name: "addLiquidityEthBytes test",
          getNonce: () => signer.getTransactionCount(),
           initBatch: approveAndFund
        }]).then(async (benchmarkReport)=>{
          const [newtestTokenReserves, newEthReserves  ] = await  getReserves (contractAddresses.testTokenAddress, contractAddresses.wethAddress)
          const newTestTokenPrice = await quotePrice( etherVal, contractAddresses.testTokenAddress, contractAddresses.wethAddress)
          const newBal = await signer.getBalance()

          console.warn("reserve diff",utils.formatEther(newEthReserves.sub(oldEthReserves)));
          console.warn("balance diff",utils.formatEther(newBal.sub(oldBal)));

          const minEthVal = etherVal.mul(995).div(1000)


          assert.ok(benchmarkReport.succeeded)
          // TODO why?
          assert.ok( 
            between (oldEthReserves.add(minEthVal.mul(count)), newEthReserves, oldEthReserves.add(etherVal.mul(count)))
          , "old eth reserves... close enough?")
          assert.ok(oldtestTokenReserves.add(oldTestTokenPrice.mul(count)).eq(newtestTokenReserves) , "TestToken reserves increase as expected")
          assert.ok(oldTestTokenPrice.eq(newTestTokenPrice), "WETH/Token price doesn't change")
        })
    });


    it('reverts on invalid addLiquiditiyETH call ', async function() {
      const [oldtestTokenReserves,  oldEthReserves] = await  getReserves (contractAddresses.testTokenAddress, contractAddresses.wethAddress)
      const count = 1

      return benchmarks.run([{
        method: addLiquidityEthBytesRevert,
        count,
        name: "addLiquidityEthBytes test",
        getNonce: () => signer.getTransactionCount(),
         initBatch: approveAndFund
      }]).then(async (benchmarkReport)=>{
        
        assert.ok(!benchmarkReport.succeeded)
        const [newtestTokenReserves, newEthReserves  ] = await  getReserves (contractAddresses.testTokenAddress, contractAddresses.wethAddress)

        assert.ok(oldtestTokenReserves.eq(newtestTokenReserves), "TestToken reserves didn't change")
        assert.ok(oldEthReserves.eq(newEthReserves), "WETH reserves did't change")

      })
    });

  })






  describe('swapETHForExactTokensBytes tests', function() {
      it('handles 3 swapExactETHForTokensBytes calls', async function() {
        const [oldtestTokenReserves,  oldEthReserves] = await  getReserves (contractAddresses.testTokenAddress, contractAddresses.wethAddress)
        const oldTestTokenPrice = await quotePrice( etherVal, contractAddresses.testTokenAddress, contractAddresses.wethAddress)
        const count = 3
        return benchmarks.run([{
          method: swapETHForExactTokensBytes,
          count,
          name: "swapETHForExactTokensBytes test",
          getNonce: () => signer.getTransactionCount(),
          initBatch: approveAndFund
        }]).then(async (benchmarkReport)=>{
          const [newtestTokenReserves, newEthReserves  ] = await  getReserves (contractAddresses.testTokenAddress, contractAddresses.wethAddress)
          const newTestTokenPrice = await quotePrice( etherVal, contractAddresses.testTokenAddress, contractAddresses.wethAddress)
          assert.ok(benchmarkReport.succeeded)

          assert.ok(oldEthReserves.lt(newEthReserves) , "WETH reserves increase")
          assert.ok(oldtestTokenReserves.sub(etherVal.mul(count)).eq(newtestTokenReserves) , "Test Token Reserves decrease as expected")
          assert.ok(oldTestTokenPrice.gt(newTestTokenPrice), "Token quoted amount goes down after swaps")
        })
    })
  })


  describe('swapExactETHForTokensBytes tests', function() {
    it('handles 3 swapExactETHForTokensBytes calls', async function() {
      const [oldtestTokenReserves,  oldEthReserves] = await  getReserves (contractAddresses.testTokenAddress, contractAddresses.wethAddress)
      const oldTestTokenPrice = await quotePrice( etherVal, contractAddresses.testTokenAddress, contractAddresses.wethAddress)
      const count = 3
      return benchmarks.run([{
        method: swapExactETHForTokensBytes,
        count,
        name: "swapExactETHForTokensBytes test",
        getNonce: () => signer.getTransactionCount(),
        initBatch: approveAndFund
      }]).then(async (benchmarkReport)=>{
        const [newtestTokenReserves, newEthReserves  ] = await  getReserves (contractAddresses.testTokenAddress, contractAddresses.wethAddress)
        const newTestTokenPrice = await quotePrice( etherVal, contractAddresses.testTokenAddress, contractAddresses.wethAddress)
        assert.ok(benchmarkReport.succeeded)

        assert.ok(oldtestTokenReserves.gt(newtestTokenReserves) , "Tokens reserves decrease")
        assert.ok(oldEthReserves.add(etherVal.mul(count)).eq(newEthReserves) , "ETH Reserves increase as expected")
        assert.ok(oldTestTokenPrice.gt(newTestTokenPrice), "Token quoted amount goes down after swaps")
      })
  })
})