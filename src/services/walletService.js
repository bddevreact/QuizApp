// Wallet Service for managing deposit addresses and networks
import firebaseService from './firebaseService'

class WalletService {
  constructor() {
    this.cache = {
      addresses: null,
      lastFetch: null,
      cacheDuration: 5 * 60 * 1000 // 5 minutes
    }
  }

  // Get all wallet addresses
  async getWalletAddresses() {
    try {
      // Check cache first
      if (this.cache.addresses && this.cache.lastFetch && 
          (Date.now() - this.cache.lastFetch) < this.cache.cacheDuration) {
        return this.cache.addresses
      }

      const addresses = await firebaseService.read('wallet_addresses')
      const activeAddresses = Array.isArray(addresses) 
        ? addresses.filter(addr => addr.isActive) 
        : []

      // Update cache
      this.cache.addresses = activeAddresses
      this.cache.lastFetch = Date.now()

      return activeAddresses
    } catch (error) {
      console.error('Error fetching wallet addresses:', error)
      return []
    }
  }

  // Get addresses by network
  async getAddressesByNetwork(network) {
    try {
      const addresses = await this.getWalletAddresses()
      return addresses.filter(addr => addr.network === network)
    } catch (error) {
      console.error('Error fetching addresses by network:', error)
      return []
    }
  }

  // Get available networks
  async getAvailableNetworks() {
    try {
      const addresses = await this.getWalletAddresses()
      const networks = [...new Set(addresses.map(addr => addr.network))]
      return networks.sort()
    } catch (error) {
      console.error('Error fetching available networks:', error)
      return []
    }
  }

  // Get network info
  getNetworkInfo(network) {
    const networkInfo = {
      'TRC20': {
        name: 'Tron (TRC20)',
        icon: '🔴',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        description: 'Fast and low-cost transactions',
        fee: '1-2 USDT',
        speed: 'Fast'
      },
      'ERC20': {
        name: 'Ethereum (ERC20)',
        icon: '🔵',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        description: 'Most widely supported',
        fee: '5-20 USDT',
        speed: 'Medium'
      },
      'BEP20': {
        name: 'BSC (BEP20)',
        icon: '🟡',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        description: 'Binance Smart Chain',
        fee: '0.5-2 USDT',
        speed: 'Fast'
      },
      'Polygon': {
        name: 'Polygon (MATIC)',
        icon: '🟣',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/30',
        description: 'Ethereum scaling solution',
        fee: '0.1-1 USDT',
        speed: 'Very Fast'
      },
      'Arbitrum': {
        name: 'Arbitrum',
        icon: '🔵',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        description: 'Layer 2 scaling',
        fee: '1-5 USDT',
        speed: 'Fast'
      },
      'Optimism': {
        name: 'Optimism',
        icon: '🔴',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        description: 'Optimistic rollup',
        fee: '1-5 USDT',
        speed: 'Fast'
      }
    }

    return networkInfo[network] || {
      name: network,
      icon: '💰',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30',
      description: 'Custom network',
      fee: 'Variable',
      speed: 'Unknown'
    }
  }

  // Validate deposit amount for network
  async validateDepositAmount(network, amount) {
    try {
      const addresses = await this.getAddressesByNetwork(network)
      if (addresses.length === 0) {
        return {
          valid: false,
          message: 'Network not available'
        }
      }

      const networkConfig = addresses[0] // Use first address config
      const minDeposit = networkConfig.minDeposit || 1
      const maxDeposit = networkConfig.maxDeposit || 10000

      if (amount < minDeposit) {
        return {
          valid: false,
          message: `Minimum deposit amount is $${minDeposit}`
        }
      }

      if (amount > maxDeposit) {
        return {
          valid: false,
          message: `Maximum deposit amount is $${maxDeposit}`
        }
      }

      return {
        valid: true,
        message: 'Amount is valid'
      }
    } catch (error) {
      console.error('Error validating deposit amount:', error)
      return {
        valid: false,
        message: 'Error validating amount'
      }
    }
  }

  // Get deposit address for network
  async getDepositAddress(network) {
    try {
      const addresses = await this.getAddressesByNetwork(network)
      if (addresses.length === 0) {
        return null
      }

      // Return the first active address for the network
      return addresses[0]
    } catch (error) {
      console.error('Error getting deposit address:', error)
      return null
    }
  }

  // Clear cache (useful when addresses are updated)
  clearCache() {
    this.cache.addresses = null
    this.cache.lastFetch = null
  }

  // Get network statistics
  async getNetworkStats() {
    try {
      const addresses = await this.getWalletAddresses()
      const stats = {}

      addresses.forEach(addr => {
        if (!stats[addr.network]) {
          stats[addr.network] = {
            count: 0,
            totalMinDeposit: 0,
            totalMaxDeposit: 0,
            active: 0
          }
        }

        stats[addr.network].count++
        stats[addr.network].totalMinDeposit += addr.minDeposit || 0
        stats[addr.network].totalMaxDeposit += addr.maxDeposit || 0
        if (addr.isActive) {
          stats[addr.network].active++
        }
      })

      return stats
    } catch (error) {
      console.error('Error getting network stats:', error)
      return {}
    }
  }
}

// Create singleton instance
const walletService = new WalletService()

export default walletService
