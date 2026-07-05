import { useState, useEffect } from 'react';
import type { Account, ConfigMeta, Statistic, Theme } from '../../lib/steam/types';
import { themeList, statisticsList } from '../../lib/steam/themes';

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
    
    if (cfg.textColor) {
      settings.push(`text-${cfg.textColor.replace('#', '')}`);
    }
    
    if (cfg.bgType === 'color' && cfg.bgColor) {
      const bgColor = cfg.bgColor.replace(/#/g, '').replace(/,/g, '-');
      settings.push(`bg-${bgColor}`);
    } else if (cfg.bgType === 'game-cover') {
      if (cfg.bgGameId) {
        settings.push(`bg-game-${cfg.bgGameId}`);
      } else {
        settings.push('bg-game');
      }
    }
    
    const defaultStats = ['groups', 'badges', 'games'];
    const isDefault = cfg.statistics.length === defaultStats.length &&
      defaultStats.every(s => cfg.statistics.includes(s as Statistic));
    
    if (!isDefault) {
      settings.push(...cfg.statistics);
    }
    
    const url = `/api/steam/card/${steamId}/${settings.join(',')}`;
    setCardUrl(url);
    setLoading(true);
  }

  function handleGenerate() {
    if (accounts.length > 0) {
      generateCard(accounts[currentIndex].steamId, config);
    }
  }

  function handleAddAccount() {
    if (!steamIdInput || steamIdInput.length !== 17) return;
    
    if (accounts.some(a => a.steamId === steamIdInput)) {
      alert('Account already exists');
      return;
    }
    
    fetch(`/api/steam/info/${steamIdInput}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }
        
        const newAccount: Account = {
          steamId: steamIdInput,
          nickName: data.nickName,
          avatarUrl: data.avatar,
        };
        
        setAccounts([...accounts, newAccount]);
        setCurrentIndex(accounts.length);
        setSteamIdInput('');
        generateCard(steamIdInput, config);
      })
      .catch(err => alert(err.message));
  }

  function handleRemoveAccount(index: number) {
    const newAccounts = accounts.filter((_, i) => i !== index);
    setAccounts(newAccounts);
    if (newAccounts.length === 0) {
      setCurrentIndex(0);
      setCardUrl('');
    } else if (currentIndex >= newAccounts.length) {
      setCurrentIndex(newAccounts.length - 1);
    }
  }

  function handleSwitchAccount(index: number) {
    setCurrentIndex(index);
    generateCard(accounts[index].steamId, config);
  }

  function updateConfig(key: keyof ConfigMeta, value: any) {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  }

  function toggleStatistic(stat: Statistic) {
    const newStats = config.statistics.includes(stat)
      ? config.statistics.filter(s => s !== stat)
      : config.statistics.length < 3
      ? [...config.statistics, stat]
      : config.statistics;
    
    updateConfig('statistics', newStats);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-sm text-gray-500 hover:text-black transition-colors mb-4 inline-block">
            ← 返回
          </a>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Steam 卡片生成器</h1>
          <p className="text-gray-500">
            快速生成你的 Steam 资料卡片，支持自定义样式和预设配置
          </p>
        </div>

        {accounts.length === 0 ? (
          /* Add Account */
          <div className="max-w-md mx-auto py-16">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">SteamID</label>
                <input
                  type="text"
                  value={steamIdInput}
                  onChange={(e) => setSteamIdInput(e.target.value)}
                  placeholder="76561198340841543"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  maxLength={17}
                />
                <p className="text-xs text-gray-400 mt-1">
                  示例: 76561198340841543
                </p>
              </div>
              <button
                onClick={handleAddAccount}
                disabled={steamIdInput.length !== 17}
                className="w-full py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                添加账号
              </button>
            </div>
          </div>
        ) : (
          /* Main Content */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Config Panel */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">配置</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={currentIndex}
                    onChange={(e) => handleSwitchAccount(Number(e.target.value))}
                    className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {accounts.map((acc, i) => (
                      <option key={acc.steamId} value={i}>{acc.nickName}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemoveAccount(currentIndex)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    移除
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium mb-2">主题</label>
                  <select
                    value={config.theme}
                    onChange={(e) => updateConfig('theme', e.target.value as Theme)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {themeList.map(theme => (
                      <option key={theme.id} value={theme.id}>{theme.label}</option>
                    ))}
                  </select>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">文本颜色</label>
                  <input
                    type="text"
                    value={config.textColor}
                    onChange={(e) => updateConfig('textColor', e.target.value)}
                    placeholder="#666666"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {/* Background Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">背景类型</label>
                  <select
                    value={config.bgType}
                    onChange={(e) => updateConfig('bgType', e.target.value as 'color' | 'game-cover')}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="color">颜色</option>
                    <option value="game-cover">游戏封面</option>
                  </select>
                </div>

                {/* Background Color/Game ID */}
                {config.bgType === 'color' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">背景颜色</label>
                    <input
                      type="text"
                      value={config.bgColor}
                      onChange={(e) => updateConfig('bgColor', e.target.value)}
                      placeholder="#564ecb,#2bcc88"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <p className="text-xs text-gray-400 mt-1">输入多个值以创建渐变色</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">游戏 AppID</label>
                    <input
                      type="text"
                      value={config.bgGameId}
                      onChange={(e) => updateConfig('bgGameId', e.target.value)}
                      placeholder="400"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <p className="text-xs text-gray-400 mt-1">如果为空，则取游戏时长最高的游戏</p>
                  </div>
                )}

                {/* Icons */}
                <div>
                  <label className="block text-sm font-medium mb-2">图标</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.badge}
                        onChange={(e) => updateConfig('badge', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm">徽章图标</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.group}
                        onChange={(e) => updateConfig('group', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm">群组图标</span>
                    </label>
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <label className="block text-sm font-medium mb-2">统计信息 (最多3个)</label>
                  <div className="space-y-2">
                    {statisticsList.map(stat => (
                      <label key={stat.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.statistics.includes(stat.value as Statistic)}
                          onChange={() => toggleStatistic(stat.value as Statistic)}
                          disabled={!config.statistics.includes(stat.value as Statistic) && config.statistics.length >= 3}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm">{stat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  className="w-full py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  生成卡片
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-6">预览</h2>
              
              {cardUrl ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="relative">
                      {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
                          <div className="text-gray-400">加载中...</div>
                        </div>
                      )}
                      <img
                        src={cardUrl}
                        alt="Steam Card"
                        onLoad={() => setLoading(false)}
                        onError={() => setLoading(false)}
                        className="w-[400px] h-[150px] rounded"
                      />
                    </div>
                  </div>

                  {/* Share Links */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">URL</label>
                      <div className="px-3 py-2 bg-gray-50 rounded text-sm break-all font-mono">
                        {window.location.origin}{cardUrl}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Markdown</label>
                      <div className="px-3 py-2 bg-gray-50 rounded text-sm break-all font-mono">
                        {`![Steam Card](${window.location.origin}${cardUrl})`}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">HTML</label>
                      <div className="px-3 py-2 bg-gray-50 rounded text-sm break-all font-mono">
                        {`<img width="400" height="150" src="${window.location.origin}${cardUrl}">`}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[150px] bg-gray-50 rounded">
                  <div className="text-gray-400">点击生成卡片</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
