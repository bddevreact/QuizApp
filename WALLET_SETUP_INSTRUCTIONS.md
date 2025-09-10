# Wallet Address Setup Instructions

## For Admins

### 1. Access Admin Panel
- Go to `/admin/wallet-settings`
- You'll see the wallet management interface

### 2. Add Wallet Addresses
- Click "Add Wallet" button
- Fill in the form:
  - **Network**: Select from TRC20, ERC20, BEP20, Polygon, Arbitrum, Optimism
  - **Wallet Name**: Give it a descriptive name (e.g., "Main TRC20 Wallet")
  - **Wallet Address**: Paste the actual wallet address
  - **Min Deposit**: Minimum amount users can deposit (e.g., $1)
  - **Max Deposit**: Maximum amount users can deposit (e.g., $10000)
  - **Processing Time**: How long it takes to process (e.g., "5-10 minutes")
  - **Active**: Check this to make it available to users

### 3. Sample Wallet Addresses
Here are some sample addresses for testing:

**TRC20 (Tron):**
- Address: `TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE`
- Min: $1, Max: $10000
- Processing: 5-10 minutes

**BEP20 (BSC):**
- Address: `0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6`
- Min: $1, Max: $10000
- Processing: 3-5 minutes

**ERC20 (Ethereum):**
- Address: `0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6`
- Min: $5, Max: $10000
- Processing: 10-15 minutes

### 4. Test the System
1. Add at least one wallet address
2. Go to user Profile page
3. Click "Deposit" button
4. Select a network from dropdown
5. Verify the wallet address appears in the "Deposit Address" field

## For Users

### 1. View Available Networks
- Go to Profile page
- Scroll down to "Deposit Addresses" section
- You'll see all available networks with their addresses

### 2. Make a Deposit
- Click "Deposit" button in Profile
- Enter amount (within min/max limits)
- Select network from dropdown
- Copy the wallet address
- Send USDT to that address
- Wait for admin approval

### 3. Network Information
Each network shows:
- **Icon and Name**: Visual identification
- **Address**: The wallet address to send to
- **Min/Max Limits**: Deposit amount restrictions
- **Processing Time**: How long it takes
- **Speed**: Network speed indicator

## Troubleshooting

### If No Networks Appear
1. Check if admin has added any wallet addresses
2. Verify addresses are marked as "Active"
3. Check browser console for errors

### If Address Field is Empty
1. Make sure a network is selected
2. Check if the selected network has a valid address
3. Try refreshing the page

### If Deposit Fails
1. Verify the amount is within min/max limits
2. Check if the network is active
3. Ensure you're sending to the correct address

## Security Notes

- **Never share private keys**
- **Always verify addresses before sending**
- **Use official wallet applications**
- **Double-check network selection**
- **Keep transaction records**

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify Firebase connection
3. Ensure wallet addresses are properly configured
4. Contact admin for assistance
