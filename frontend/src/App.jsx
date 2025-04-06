import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "./constants";
import ABI from "./abi/TibJar.json";
import "./App.css";

function App() {
  const [account, setAccount] = useState(null); // 钱包地址
  const [contract, setContract] = useState(null); // 合约实例
  const [balance, setBalance] = useState("0"); // 余额
  const [owner, setOwnesr] = useState(null); // 所有者
  const [amount, setAmount] = useState(""); // 金额

  // 连接钱包
  const connectWallet = async () => {
    if (window.ethereum) {
      const [selectedAccount] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(selectedAccount);
    } else {
      alert("请安装 MetaMask 扩展插件！");
    }
  };

  // 初始化合约
  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return; // 检查是否安装 MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum); // 创建提供者
      const signer = await provider.getSigner(); // 获取签名者
      const tipJar = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer); // 创建合约实例
      setContract(tipJar); // 设置合约实例

      const ownerAddress = await tipJar.owner(); // 获取所有者地址
      setOwnesr(ownerAddress); // 设置所有者地址

      const currentBalance = await tipJar.getBalance(); // 获取余额
      setBalance(ethers.formatEther(currentBalance)); // 设置余额
    };

    init();
  }, [account]);

  // 发送小费
  const sendTip = async () => {
    if (!amount || isNaN(amount)) return alert("请输入合法金额");

    try {
      const tx = await contract.tip({ // 调用 tip 函数
        value: ethers.parseEther(amount), // 转换为以太坊
      });
      await tx.wait(); // 等待交易确认
      alert("Tip sent!"); // 提示成功
      setAmount(""); // 清空金额
      const currentBalance = await contract.getBalance(); // 获取余额
      setBalance(ethers.formatEther(currentBalance)); // 设置余额
    } catch (err) {
      console.error(err); // 输出错误
      alert("发送失败！"); // 提示失败
    }
  };

  // 提现
  const withdraw = async () => {
    try {
      const tx = await contract.withdraw(); // 调用 withdraw 函数
      await tx.wait(); // 等待交易确认
      alert("提现成功！"); // 提示成功
      const currentBalance = await contract.getBalance(); // 获取余额
      setBalance(ethers.formatEther(currentBalance)); // 设置余额
    } catch (err) {
      console.error(err); // 输出错误
      alert("提现失败！"); // 提示失败
    }
  };

  return (
    <div className="container">
      <h1>💸 TipJar DApp</h1>
      {!account ? (
        <button onClick={connectWallet}>连接钱包</button>
      ) : (
        <>
          <p>当前地址：{account}</p>
          <p>合约余额：{balance} ETH</p>

          <input
            placeholder="输入打赏金额 (ETH)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={sendTip}>打赏</button>
          {console.log(owner)}
          {console.log(account)}
          {account?.toLowerCase() === owner?.toLowerCase() ? (
            <button style={{ marginTop: "1rem" }} onClick={withdraw}>
              提现到 Owner
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

export default App;
