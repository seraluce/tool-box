import { useState, useEffect, useRef } from 'react';
import type { Account, ConfigMeta, Statistic, Theme } from '../../lib/steam/types';
import { themeList, statisticsList } from '../../lib/steam/themes';

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-normal text-white bg-gray-900 dark:bg-gray-700 rounded-lg whitespace-nowrap z-50 shadow-lg animate-fade-in">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </span>
      )}
    </span>
  );
}

function InfoIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.93 12.18h-1.86V5.73h1.86v6.45zm0-8.09h-1.86V2.27h1.86v1.82z"/>
    </svg>
  );
}

function LabelWithHint({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <Tooltip text={hint}><InfoIcon /></Tooltip>
    </div>
  );
}

export default function SteamCardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [config, setConfig] = useState<ConfigMeta>({
    theme: 'dark',
    textColor: '',
    bgType: 'color',
    bgColor: '',
    bgGameId: '',
    group: true,
    badge: true,
    statistics: ['groups', 'badges', 'games'],
  });
  const [cardUrl, setCardUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [steamIdInput, setSteamIdInput] = useState('');
  const [copied, setCopied] = useState('');
  const [showIdHint, setShowIdHint] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('steam-accounts');
    if (saved) {
      const accs = JSON.parse(saved);
      setAccounts(accs);
      if (accs.length > 0) {
        generateCard(accs[0].steamId, config);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('steam-accounts', JSON.stringify(accounts));
  }, [accounts]);

  function generateCard(steamId: string, cfg: ConfigMeta) {
    const settings: string[] = [cfg.theme];
    if (cfg.badge) settings.push('badge');
    if (cfg.group) settings.push('group');
    if (cfg.textColor) settings.push(`text-${cfg.textColor.replace('#', '')}`);
    if (cfg.bgType === 'color' && cfg.bgColor) {
      const bgColor = cfg.bgColor.replace(/#/g, '').replace(/,/g, '-');
      settings.push(`bg-${bgColor}`);
    } else if (cfg.bgType === 'game-cover') {
      settings.push(cfg.bgGameId ? `bg-game-${cfg.bgGameId}` : 'bg-game');
    }
    const defaultStats = ['groups', 'badges', 'games'];
    const isDefault = cfg.statistics.length === defaultStats.length &&
      defaultStats.every(s => cfg.statistics.includes(s as Statistic));
    if (!isDefault) settings.push(...cfg.statistics);

    const settingsStr = settings.join(',');
    const url = settingsStr
      ? `/api/steam/card/${steamId}?s=${encodeURIComponent(settingsStr)}`
      : `/api/steam/card/${steamId}`;
    setCardUrl(url);
    setLoading(true);
  }

  function handleGenerate() {
    if (accounts.length > 0) generateCard(accounts[currentIndex].steamId, config);
  }

  function handleAddAccount() {
    if (!steamIdInput || steamIdInput.length !== 17) return;
    if (accounts.some(a => a.steamId === steamIdInput)) return;
    fetch(`/api/steam/info/${steamIdInput}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) return;
        const newAccount: Account = { steamId: steamIdInput, nickName: data.nickName, avatarUrl: data.avatar };
        setAccounts([...accounts, newAccount]);
        setCurrentIndex(accounts.length);
        setSteamIdInput('');
        generateCard(steamIdInput, config);
      })
      .catch(() => {});
  }

  function handleRemoveAccount(index: number) {
    const newAccounts = accounts.filter((_, i) => i !== index);
    setAccounts(newAccounts);
    if (newAccounts.length === 0) { setCurrentIndex(0); setCardUrl(''); }
    else if (currentIndex >= newAccounts.length) setCurrentIndex(newAccounts.length - 1);
  }

  function handleSwitchAccount(index: number) {
    setCurrentIndex(index);
    generateCard(accounts[index].steamId, config);
  }

  function updateConfig(key: keyof ConfigMeta, value: any) {
    setConfig({ ...config, [key]: value });
  }

  function toggleStatistic(stat: Statistic) {
    const newStats = config.statistics.includes(stat)
      ? config.statistics.filter(s => s !== stat)
      : config.statistics.length < 3 ? [...config.statistics, stat] : config.statistics;
    updateConfig('statistics', newStats);
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Top Bar */}
      <div className="flex-none border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4L6 8l4 4"/></svg>
            返回
          </a>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <h1 className="text-sm font-semibold">Steam 卡片生成器</h1>
        </div>
        {accounts.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={currentIndex}
              onChange={(e) => handleSwitchAccount(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {accounts.map((acc, i) => (
                <option key={acc.steamId} value={i}>{acc.nickName}</option>
              ))}
            </select>
            <button onClick={() => handleRemoveAccount(currentIndex)} className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              移除
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {accounts.length === 0 ? (
          /* Add Account - Centered */
          <div className="h-full flex items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-5">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-1">添加 Steam 账号</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">输入你的 SteamID64 开始生成卡片</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">SteamID64</label>
                  <button onClick={() => setShowIdHint(!showIdHint)} className="text-xs text-blue-500 hover:text-blue-600 transition-colors">
                    如何获取？
                  </button>
                </div>
                <input
                  type="text"
                  value={steamIdInput}
                  onChange={(e) => setSteamIdInput(e.target.value)}
                  placeholder="76561198340841543"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  maxLength={17}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAccount()}
                />

                {showIdHint && (
                  <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300 space-y-2 animate-fade-in">
                    <p className="font-medium text-blue-800 dark:text-blue-200">获取 SteamID64 的方法：</p>
                    <ol className="list-decimal pl-4 space-y-1.5">
                      <li>打开 <span className="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">steamid.io</span> 或 <span className="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">steamidfinder.com</span></li>
                      <li>输入你的 Steam 个人资料链接或自定义 URL</li>
                      <li>复制 <span className="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">steamID64</span> 格式的 ID</li>
                    </ol>
                    <p className="text-blue-600 dark:text-blue-400">格式为 17 位数字，以 7656 开头</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleAddAccount}
                disabled={steamIdInput.length !== 17}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                添加账号
              </button>
            </div>
          </div>
        ) : (
          /* Config + Preview Split */
          <div className="h-full grid grid-cols-1 lg:grid-cols-[380px_1fr] overflow-hidden">
            {/* Config Panel */}
            <div className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] overflow-y-auto p-5 space-y-5">
              {/* Theme */}
              <div>
                <LabelWithHint label="主题" hint="选择卡片的配色方案" />
                <div className="grid grid-cols-3 gap-2">
                  {themeList.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => updateConfig('theme', theme.id)}
                      className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                        config.theme === theme.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ background: theme.color }} />
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div>
                <LabelWithHint label="文本颜色" hint="自定义文字颜色，留空使用主题默认值。输入 HEX 色值如 #FF5500" />
                <input
                  type="text"
                  value={config.textColor}
                  onChange={(e) => updateConfig('textColor', e.target.value)}
                  placeholder="#666666"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Background */}
              <div>
                <LabelWithHint label="背景" hint="可选择纯色/渐变背景，或使用游戏封面作为背景" />
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => updateConfig('bgType', 'color')}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-all ${config.bgType === 'color' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    颜色
                  </button>
                  <button
                    onClick={() => updateConfig('bgType', 'game-cover')}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-all ${config.bgType === 'game-cover' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    游戏封面
                  </button>
                </div>
                {config.bgType === 'color' ? (
                  <input
                    type="text"
                    value={config.bgColor}
                    onChange={(e) => updateConfig('bgColor', e.target.value)}
                    placeholder="#564ecb,#2bcc88"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                ) : (
                  <input
                    type="text"
                    value={config.bgGameId}
                    onChange={(e) => updateConfig('bgGameId', e.target.value)}
                    placeholder="400（留空取时长最高的游戏）"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                )}
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  {config.bgType === 'color' ? '多个颜色用逗号分隔可创建渐变' : 'AppID 可在 Steam 商店链接中找到'}
                </p>
              </div>

              {/* Icons */}
              <div>
                <LabelWithHint label="图标" hint="选择在卡片中显示的图标元素" />
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <input type="checkbox" checked={config.badge} onChange={(e) => updateConfig('badge', e.target.checked)} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs">徽章</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <input type="checkbox" checked={config.group} onChange={(e) => updateConfig('group', e.target.checked)} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs">群组</span>
                  </label>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <LabelWithHint label="统计信息" hint="选择最多 3 项统计数据展示在卡片上" />
                <div className="flex flex-wrap gap-2">
                  {statisticsList.map(stat => {
                    const active = config.statistics.includes(stat.value as Statistic);
                    const disabled = !active && config.statistics.length >= 3;
                    return (
                      <button
                        key={stat.value}
                        onClick={() => toggleStatistic(stat.value as Statistic)}
                        disabled={disabled}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                          active
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : disabled
                            ? 'border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {stat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/20"
              >
                生成卡片
              </button>
            </div>

            {/* Preview Panel */}
            <div className="overflow-y-auto p-6 flex flex-col" ref={previewRef}>
              {cardUrl ? (
                <div className="space-y-6 max-w-2xl mx-auto w-full">
                  {/* Card Preview */}
                  <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 flex items-center justify-center min-h-[200px]">
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-xl z-10">
                        <div className="flex items-center gap-3 text-gray-400">
                          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          <span className="text-sm">生成中...</span>
                        </div>
                      </div>
                    )}
                    <img
                      src={cardUrl}
                      alt="Steam Card"
                      onLoad={() => setLoading(false)}
                      onError={() => setLoading(false)}
                      className="max-w-full rounded-lg shadow-sm"
                    />
                  </div>

                  {/* Share Codes */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">嵌入代码</h3>
                    
                    {[
                      { label: 'URL', value: `${typeof window !== 'undefined' ? window.location.origin : ''}${cardUrl}`, key: 'url' },
                      { label: 'Markdown', value: `![Steam Card](${typeof window !== 'undefined' ? window.location.origin : ''}${cardUrl})`, key: 'md' },
                      { label: 'HTML', value: `<img width="400" height="150" src="${typeof window !== 'undefined' ? window.location.origin : ''}${cardUrl}">`, key: 'html' },
                    ].map(item => (
                      <div key={item.key} className="group relative">
                        <label className="block text-[11px] text-gray-400 dark:text-gray-500 mb-1 font-medium">{item.label}</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono break-all text-gray-600 dark:text-gray-400">
                            {item.value}
                          </div>
                          <button
                            onClick={() => copyText(item.value, item.key)}
                            className="flex-none p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            {copied === item.key ? (
                              <svg className="w-4 h-4 text-green-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l3 3 7-7"/></svg>
                            ) : (
                              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="8" height="8" rx="1.5"/><path d="M3 10V3.5A1.5 1.5 0 014.5 2H10"/></svg>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-400 dark:text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                      <rect x="2" y="4" width="20" height="16" rx="3"/>
                      <path d="M6 8h4M6 12h8M6 16h5"/>
                    </svg>
                    <p className="text-sm">配置完成后点击「生成卡片」</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
